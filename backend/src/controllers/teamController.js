const User = require("../models/User");
const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");
const { assignPendingStudents } = require("../services/teamAssignment");

async function getTeams(req, res) {
    try {
        res.json(await Team.find({ hackathonId: null }).sort({ createdAt: 1 }));
    } catch (error) {
        res.status(500).json({ message: "Could not get teams" });
    }
}

async function getPendingStudents(req, res) {
    try {
        const teams = await Team.find({ hackathonId: null });
        const assignedIds = new Set();
        const assignedEmails = new Set();
        teams.forEach(function (team) {
            team.members.forEach(function (member) {
                if (member.userId) assignedIds.add(String(member.userId));
                if (member.email) assignedEmails.add(member.email.trim().toLowerCase());
            });
        });

        const students = await User.find({ role: "student" }).sort({ createdAt: 1 });
        const events = await Hackathon.find({}, "participants.userId");
        const eventParticipantIds = new Set();
        events.forEach(function (event) {
            event.participants.forEach(function (participant) {
                eventParticipantIds.add(String(participant.userId));
            });
        });
        const pendingStudents = students.filter(function (student) {
            return !assignedIds.has(String(student._id)) && !assignedEmails.has(student.email.trim().toLowerCase()) && !eventParticipantIds.has(String(student._id));
        }).map(function (student) {
            return {
                id: student._id,
                name: student.firstName + " " + student.lastName,
                email: student.email,
                skill: student.skill || "General"
            };
        });
        res.json(pendingStudents);
    } catch (error) {
        res.status(500).json({ message: "Could not get pending students" });
    }
}

async function generateTeams(req, res) {
    try {
        const teamSize = Number((req.body || {}).teamSize);
        const teamCount = Number((req.body || {}).teamCount);
        if (!Number.isInteger(teamSize) || teamSize < 2 || teamSize > 10) {
            return res.status(400).json({ message: "Team size must be between 2 and 10" });
        }
        if (!Number.isInteger(teamCount) || teamCount < 1 || teamCount > 20) {
            return res.status(400).json({ message: "Number of teams to add must be between 1 and 20" });
        }

        const existingTeams = await Team.find({ hackathonId: null }).sort({ createdAt: 1 });
        const newTeams = [];
        for (let index = 0; index < teamCount; index += 1) {
            newTeams.push({
                name: "Team " + (existingTeams.length + index + 1),
                maxSize: teamSize,
                members: []
            });
        }
        await Team.insertMany(newTeams);

        const assignment = await assignPendingStudents();
        const teams = await Team.find({ hackathonId: null }).sort({ createdAt: 1 });
        res.status(201).json({
            message: teamCount + " new team(s) added. " + assignment.assignedCount + " pending student(s) assigned; " + assignment.pendingCount + " still waiting.",
            teams,
            assignedCount: assignment.assignedCount,
            pendingCount: assignment.pendingCount
        });
    } catch (error) {
        res.status(500).json({ message: "Could not generate teams" });
    }
}

async function joinTeam(req, res) {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) return res.status(404).json({ message: "Team not found" });
        if (team.hackathonId) return res.status(400).json({ message: "Join this team from its hackathon page" });
        if (team.members.some(function (member) { return String(member.userId) === req.user.id; })) {
            return res.status(400).json({ message: "You are already in this team" });
        }
        const alreadyJoined = await Team.findOne({ hackathonId: null, "members.userId": req.user.id });
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

module.exports = { getTeams, getPendingStudents, generateTeams, joinTeam };
