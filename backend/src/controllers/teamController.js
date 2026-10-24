const User = require("../models/User");
const Team = require("../models/Team");

async function getTeams(req, res) {
    try {
        res.json(await Team.find().sort({ createdAt: 1 }));
    } catch (error) {
        res.status(500).json({ message: "Could not get teams" });
    }
}

async function generateTeams(req, res) {
    try {
        const teamSize = Number(req.body.teamSize);
        if (!Number.isInteger(teamSize) || teamSize < 2 || teamSize > 10) {
            return res.status(400).json({ message: "Team size must be between 2 and 10" });
        }

        const participants = await User.find({ role: "student" }).sort({ createdAt: 1 });
        if (participants.length === 0) return res.status(400).json({ message: "No students have signed up yet" });

        const skillGroups = {};
        participants.forEach(function (person) {
            const skill = person.skill || "General";
            if (!skillGroups[skill]) skillGroups[skill] = [];
            skillGroups[skill].push(person);
        });

        const numberOfTeams = Math.ceil(participants.length / teamSize);
        const groups = Array.from({ length: numberOfTeams }, function () { return []; });
        let teamIndex = 0;
        Object.values(skillGroups).forEach(function (group) {
            group.forEach(function (person) {
                groups[teamIndex].push({ userId: person._id, name: person.firstName + " " + person.lastName, email: person.email, skill: person.skill || "General" });
                teamIndex = (teamIndex + 1) % numberOfTeams;
            });
        });

        await Team.deleteMany({});
        const teams = await Team.insertMany(groups.map(function (members, index) {
            return { name: "Team " + (index + 1), maxSize: teamSize, members };
        }));
        res.status(201).json({ message: "Teams generated", teams });
    } catch (error) {
        res.status(500).json({ message: "Could not generate teams" });
    }
}

async function joinTeam(req, res) {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) return res.status(404).json({ message: "Team not found" });
        if (team.members.some(function (member) { return String(member.userId) === req.user.id; })) {
            return res.status(400).json({ message: "You are already in this team" });
        }
        const alreadyJoined = await Team.findOne({ "members.userId": req.user.id });
        if (alreadyJoined) return res.status(400).json({ message: "You are already in a team" });
        if (team.members.length >= team.maxSize) return res.status(400).json({ message: "This team is full" });

        const user = await User.findById(req.user.id);
        team.members.push({ userId: user._id, name: user.firstName + " " + user.lastName, email: user.email, skill: user.skill || "General" });
        await team.save();
        res.json({ message: "Joined team successfully", team });
    } catch (error) {
        res.status(500).json({ message: "Could not join team" });
    }
}

module.exports = { getTeams, generateTeams, joinTeam };
