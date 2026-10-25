const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Hackathon = require("../models/Hackathon");
const { syncStudentProfile, removeStudentRecords } = require("../services/studentRecords");

function publicUser(user) {
    return { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, skill: user.skill };
}

function makeToken(user) {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function signup(req, res) {
    try {
        const { firstName, lastName, email, password, role, skill } = req.body;
        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }
        if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
        if (!["student", "organizer"].includes(role)) return res.status(400).json({ message: "Role must be student or organizer" });

        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
        if (existingUser) return res.status(409).json({ message: "Email already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ firstName, lastName, email, password: hashedPassword, role, skill: role === "student" ? (skill || "General") : "General" });
        res.status(201).json({ message: "Account created", token: makeToken(user), user: publicUser(user) });
    } catch (error) {
        res.status(500).json({ message: "Could not create account" });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: (email || "").trim().toLowerCase() });
        if (!user || !(await bcrypt.compare(password || "", user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        res.json({ message: "Login successful", token: makeToken(user), user: publicUser(user) });
    } catch (error) {
        res.status(500).json({ message: "Could not login" });
    }
}

async function updateProfile(req, res) {
    try {
        const { firstName, lastName, email, skill } = req.body;
        if (!firstName || !lastName || !email) return res.status(400).json({ message: "Please fill all required fields" });
        const normalizedEmail = email.trim().toLowerCase();
        const duplicate = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user.id } });
        if (duplicate) return res.status(409).json({ message: "Email already registered" });

        const user = await User.findByIdAndUpdate(req.user.id, {
            firstName, lastName, email: normalizedEmail,
            skill: req.user.role === "student" ? (skill || "General") : "General"
        }, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ message: "User not found" });

        await syncStudentProfile(user);

        res.json({ message: "Profile updated", user: publicUser(user) });
    } catch (error) {
        res.status(500).json({ message: "Could not update profile" });
    }
}

async function getProfile(req, res) {
    try {
        const user = await User.findById(req.user.id).select("firstName lastName email role skill");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ user: publicUser(user) });
    } catch (error) {
        res.status(500).json({ message: "Could not get profile" });
    }
}

async function deleteProfile(req, res) {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role === "organizer" && await Hackathon.exists({ organizerId: user._id })) {
            return res.status(409).json({ message: "Delete your hackathons before deleting this organizer account" });
        }
        await removeStudentRecords(user);
        res.json({ message: "Account and associated participant records deleted" });
    } catch (error) {
        res.status(500).json({ message: "Could not delete account" });
    }
}

module.exports = { signup, login, getProfile, updateProfile, deleteProfile };
