const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const { syncStudentProfile, removeStudentRecords } = require("../services/studentRecords");

function toParticipant(user) {
    return { id: user._id, name: user.firstName + " " + user.lastName, firstName: user.firstName, lastName: user.lastName, email: user.email, skill: user.skill || "General" };
}

async function getParticipants(req, res) {
    try {
        const users = await User.find({ role: "student" }).select("firstName lastName email skill").sort({ createdAt: 1 });
        res.json(users.map(toParticipant));
    } catch (error) {
        res.status(500).json({ message: "Could not get participants" });
    }
}

async function getParticipant(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid participant ID" });
        const user = await User.findOne({ _id: req.params.id, role: "student" }).select("firstName lastName email skill");
        if (!user) return res.status(404).json({ message: "Participant not found" });
        res.json(toParticipant(user));
    } catch (error) {
        res.status(500).json({ message: "Could not get participant" });
    }
}

async function createParticipant(req, res) {
    try {
        const body = req.body || {};
        const firstName = String(body.firstName || "").trim();
        const lastName = String(body.lastName || "").trim();
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");
        if (!firstName || !lastName || !email || !password) return res.status(400).json({ message: "First name, last name, email, and password are required" });
        if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
        if (await User.findOne({ email })) return res.status(409).json({ message: "Email already registered" });

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: await bcrypt.hash(password, 10),
            role: "student",
            skill: String(body.skill || "General").trim() || "General"
        });
        res.status(201).json({ message: "Participant created", participant: toParticipant(user) });
    } catch (error) {
        res.status(500).json({ message: "Could not create participant" });
    }
}

async function updateParticipant(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid participant ID" });
        const user = await User.findOne({ _id: req.params.id, role: "student" });
        if (!user) return res.status(404).json({ message: "Participant not found" });

        const body = req.body || {};
        for (const field of ["firstName", "lastName"]) {
            if (body[field] !== undefined) {
                const value = String(body[field]).trim();
                if (!value) return res.status(400).json({ message: "First and last name cannot be empty" });
                user[field] = value;
            }
        }
        if (body.email !== undefined) {
            const email = String(body.email).trim().toLowerCase();
            if (!email) return res.status(400).json({ message: "Email cannot be empty" });
            const duplicate = await User.findOne({ email, _id: { $ne: user._id } });
            if (duplicate) return res.status(409).json({ message: "Email already registered" });
            user.email = email;
        }
        if (body.skill !== undefined) user.skill = String(body.skill).trim() || "General";
        await user.save();
        await syncStudentProfile(user);
        res.json({ message: "Participant updated", participant: toParticipant(user) });
    } catch (error) {
        res.status(500).json({ message: "Could not update participant" });
    }
}

async function deleteParticipant(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid participant ID" });
        const user = await User.findOne({ _id: req.params.id, role: "student" });
        if (!user) return res.status(404).json({ message: "Participant not found" });
        await removeStudentRecords(user);
        res.json({ message: "Participant and associated records deleted" });
    } catch (error) {
        res.status(500).json({ message: "Could not delete participant" });
    }
}

module.exports = { getParticipants, getParticipant, createParticipant, updateParticipant, deleteParticipant };
