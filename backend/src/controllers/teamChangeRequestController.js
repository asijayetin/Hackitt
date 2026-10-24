const User = require("../models/User");
const Team = require("../models/Team");
const TeamChangeRequest = require("../models/TeamChangeRequest");
const mongoose = require("mongoose");

async function createRequest(req, res) {
    try {
        const reason = String((req.body || {}).reason || "").trim();
        if (reason.length < 5) return res.status(400).json({ message: "Please explain your reason in at least 5 characters" });

        const pendingRequest = await TeamChangeRequest.findOne({ studentId: req.user.id, status: "pending" });
        if (pendingRequest) return res.status(409).json({ message: "You already have a pending request" });

        const team = await Team.findOne({ "members.userId": req.user.id });
        if (!team) return res.status(400).json({ message: "You need an assigned team before requesting a change" });

        const user = await User.findById(req.user.id);
        const request = await TeamChangeRequest.create({
            studentId: user._id,
            studentName: user.firstName + " " + user.lastName,
            studentEmail: user.email,
            currentTeamId: team._id,
            currentTeamName: team.name,
            reason
        });
        res.status(201).json({ message: "Team change request sent", request });
    } catch (error) {
        res.status(500).json({ message: "Could not send team change request" });
    }
}

async function getMyRequest(req, res) {
    try {
        const request = await TeamChangeRequest.findOne({ studentId: req.user.id }).sort({ createdAt: -1 });
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: "Could not get your request" });
    }
}

async function getRequests(req, res) {
    try {
        const requests = await TeamChangeRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Could not get team change requests" });
    }
}

async function updateRequest(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid request ID" });
        }
        const status = (req.body || {}).status;
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Choose approved or rejected" });
        }

        const request = await TeamChangeRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });
        if (request.status !== "pending") return res.status(400).json({ message: "This request was already reviewed" });

        if (status === "rejected") {
            request.status = "rejected";
            await request.save();
            return res.json({ message: "Request rejected", request });
        }

        const currentTeam = await Team.findById(request.currentTeamId);
        if (!currentTeam) return res.status(404).json({ message: "The student's current team no longer exists" });
        const member = currentTeam.members.find(function (person) {
            return String(person.userId) === String(request.studentId);
        });
        if (!member) return res.status(404).json({ message: "Student is no longer in the requested team" });

        const otherTeams = await Team.find({
            _id: { $ne: currentTeam._id },
            hackathonId: currentTeam.hackathonId || null
        }).sort({ createdAt: 1 });
        const newTeam = otherTeams.find(function (team) {
            return team.members.length < team.maxSize;
        });
        if (!newTeam) {
            return res.status(409).json({ message: "No other team has a free spot. Add a team, then approve this request." });
        }

        newTeam.members.push({ userId: member.userId, name: member.name, email: member.email, skill: member.skill });
        currentTeam.members = currentTeam.members.filter(function (person) {
            return String(person.userId) !== String(request.studentId);
        });
        await newTeam.save();
        await currentTeam.save();

        request.status = "approved";
        request.newTeamId = newTeam._id;
        request.newTeamName = newTeam.name;
        await request.save();
        res.json({ message: "Request approved and student moved to " + newTeam.name, request });
    } catch (error) {
        res.status(500).json({ message: "Could not update team change request" });
    }
}

module.exports = { createRequest, getMyRequest, getRequests, updateRequest };
