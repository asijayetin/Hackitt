const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const User = require("../models/User");
const mongoose = require("mongoose");
const { updateHackathonTeams } = require("../services/hackathonTeams");

async function listHackathons(req, res) {
    try {
        let query = {};
        if (req.user.role === "organizer") {
            query = { organizerId: req.user.id };
        } else {
            query = { $or: [{ status: "open" }, { "participants.userId": req.user.id }] };
        }

        const hackathons = await Hackathon.find(query).sort({ createdAt: -1 });
        const currentUser = await User.findById(req.user.id).select("skill");
        const studentSkill = (currentUser && currentUser.skill || "General").trim().toLowerCase();
        const hackathonIds = hackathons.map(function (hackathon) { return hackathon._id; });
        const teams = await Team.find({ hackathonId: { $in: hackathonIds } });

        res.json(hackathons.map(function (hackathon) {
            const eventTeams = teams.filter(function (team) {
                return String(team.hackathonId) === String(hackathon._id);
            });
            const myTeam = eventTeams.find(function (team) {
                return team.members.some(function (member) {
                    return String(member.userId) === req.user.id;
                });
            });
            const assignedCount = eventTeams.reduce(function (total, team) {
                return total + team.members.length;
            }, 0);

            return {
                id: hackathon._id,
                name: hackathon.name,
                description: hackathon.description,
                minTeamSize: hackathon.minTeamSize,
                maxTeamSize: hackathon.maxTeamSize,
                requiredSkills: hackathon.requiredSkills,
                prizePool: hackathon.prizePool,
                results: hackathon.results,
                eligible: !hackathon.requiredSkills.length || hackathon.requiredSkills.some(function (skill) {
                    return skill.trim().toLowerCase() === studentSkill;
                }),
                status: hackathon.status,
                participantCount: hackathon.participants.length,
                teamCount: eventTeams.length,
                waitingCount: Math.max(hackathon.participants.length - assignedCount, 0),
                joined: hackathon.participants.some(function (person) {
                    return String(person.userId) === req.user.id;
                }),
                teamName: myTeam ? myTeam.name : null,
                teamMembers: req.user.role === "organizer"
                    ? eventTeams.map(function (team) {
                        return {
                            id: team._id,
                            name: team.name,
                            maxSize: team.maxSize,
                            members: team.members.map(function (member) {
                                return { name: member.name, skill: member.skill || "General" };
                            })
                        };
                    })
                    : myTeam
                        ? myTeam.members.map(function (member) {
                            return { name: member.name, skill: member.skill || "General" };
                        })
                        : []
            };
        }));
    } catch (error) {
        res.status(500).json({ message: "Could not load hackathons" });
    }
}

async function createHackathon(req, res) {
    try {
        const body = req.body || {};
        const name = String(body.name || "").trim();
        const description = String(body.description || "").trim();
        const minTeamSize = Number(body.minTeamSize);
        const maxTeamSize = Number(body.maxTeamSize);
        const requiredSkills = Array.isArray(body.requiredSkills)
            ? body.requiredSkills.map(function (skill) { return String(skill).trim(); }).filter(Boolean)
            : [];
        const prizePool = {
            first: body.prizePool && body.prizePool.first !== undefined ? Math.max(0, Number(body.prizePool.first) || 0) : 10000,
            second: body.prizePool && body.prizePool.second !== undefined ? Math.max(0, Number(body.prizePool.second) || 0) : 5000,
            third: body.prizePool && body.prizePool.third !== undefined ? Math.max(0, Number(body.prizePool.third) || 0) : 3000
        };

        if (!name || !description) {
            return res.status(400).json({ message: "Enter a hackathon name and description" });
        }
        if (!Number.isInteger(minTeamSize) || !Number.isInteger(maxTeamSize) || minTeamSize < 2 || maxTeamSize > 10 || maxTeamSize < minTeamSize) {
            return res.status(400).json({ message: "Team sizes must be between 2 and 10, and maximum must be at least minimum" });
        }

        const hackathon = await Hackathon.create({
            organizerId: req.user.id,
            name,
            description,
            minTeamSize,
            maxTeamSize,
            requiredSkills,
            prizePool
        });
        res.status(201).json({ message: "Hackathon created", hackathon });
    } catch (error) {
        res.status(500).json({ message: "Could not create hackathon" });
    }
}

async function joinHackathon(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid hackathon ID" });
        const hackathon = await Hackathon.findById(req.params.id);
        if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
        if (hackathon.status !== "open") return res.status(409).json({ message: "Registration for this hackathon is closed" });

        const alreadyJoined = hackathon.participants.some(function (person) {
            return String(person.userId) === req.user.id;
        });
        if (alreadyJoined) return res.status(409).json({ message: "You have already joined this hackathon" });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        const skillMatches = hackathon.requiredSkills.some(function (skill) {
            return skill.trim().toLowerCase() === (user.skill || "General").trim().toLowerCase();
        });
        if (hackathon.requiredSkills.length && !skillMatches) {
            return res.status(400).json({ message: "This hackathon needs these skills: " + hackathon.requiredSkills.join(", ") + ". Update your profile skill if it matches." });
        }

        hackathon.participants.push({
            userId: user._id,
            name: user.firstName + " " + user.lastName,
            email: user.email,
            skill: user.skill || "General"
        });
        await hackathon.save();

        const assignment = await updateHackathonTeams(hackathon);
        const team = await Team.findOne({ hackathonId: hackathon._id, "members.userId": user._id });
        res.status(201).json({
            message: team ? "You joined and were assigned to " + team.name : "You joined. A team will form when enough students sign up.",
            teamName: team ? team.name : null,
            participantCount: hackathon.participants.length,
            ...assignment
        });
    } catch (error) {
        res.status(500).json({ message: "Could not join hackathon" });
    }
}

async function updateHackathonStatus(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid hackathon ID" });
        if (!["open", "closed"].includes((req.body || {}).status)) {
            return res.status(400).json({ message: "Status must be open or closed" });
        }
        const hackathon = await Hackathon.findOne({ _id: req.params.id, organizerId: req.user.id });
        if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
        hackathon.status = req.body.status;
        await hackathon.save();
        res.json({ message: "Hackathon registration is now " + hackathon.status, status: hackathon.status });
    } catch (error) {
        res.status(500).json({ message: "Could not update hackathon" });
    }
}

async function saveHackathonResults(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid hackathon ID" });
        const hackathon = await Hackathon.findOne({ _id: req.params.id, organizerId: req.user.id });
        if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
        if (hackathon.status === "open") return res.status(409).json({ message: "Close registration before declaring winners" });

        const selections = Array.isArray((req.body || {}).winners) ? req.body.winners : [];
        if (!selections[0] || !selections[0].teamId) {
            return res.status(400).json({ message: "Select a first place team" });
        }
        const teams = await Team.find({ hackathonId: hackathon._id });
        const results = [];
        const usedTeams = new Set();
        for (let rank = 1; rank <= 3; rank += 1) {
            const selectedId = selections[rank - 1] && selections[rank - 1].teamId;
            if (!selectedId) continue;
            if (!mongoose.isValidObjectId(selectedId) || usedTeams.has(String(selectedId))) {
                return res.status(400).json({ message: "Choose a different valid team for each prize place" });
            }
            const team = teams.find(function (item) { return String(item._id) === String(selectedId); });
            if (!team) return res.status(400).json({ message: "Selected team does not belong to this hackathon" });
            usedTeams.add(String(selectedId));
            results.push({
                rank,
                teamId: team._id,
                teamName: team.name,
                prizeAmount: hackathon.prizePool[["first", "second", "third"][rank - 1]],
                members: team.members.map(function (member) { return { name: member.name, skill: member.skill || "General" }; })
            });
        }
        if (!results.length) return res.status(400).json({ message: "Select at least one winning team" });
        hackathon.results = results;
        hackathon.status = "completed";
        await hackathon.save();
        res.json({ message: "Winners saved and hackathon completed", results: hackathon.results });
    } catch (error) {
        res.status(500).json({ message: "Could not save hackathon results" });
    }
}

module.exports = { listHackathons, createHackathon, joinHackathon, updateHackathonStatus, saveHackathonResults };
