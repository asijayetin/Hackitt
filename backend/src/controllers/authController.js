const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Team = require("../models/Team");
const { assignNewStudent } = require("../services/teamAssignment");

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
        let teamName = null;
        if (user.role === "student") {
            try {
                const team = await assignNewStudent(user);
                teamName = team ? team.name : null;
            } catch (error) {
                console.error("Could not assign new student to a team:", error.message);
            }
        }
        res.status(201).json({ message: "Account created", teamName, token: makeToken(user), user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, skill: user.skill } });
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
        res.json({ message: "Login successful", token: makeToken(user), user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, skill: user.skill } });
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

        await Team.updateMany({ "members.userId": user._id }, { $set: {
            "members.$[member].name": user.firstName + " " + user.lastName,
            "members.$[member].email": user.email,
            "members.$[member].skill": user.skill
        } }, { arrayFilters: [{ "member.userId": user._id }] });

        res.json({ message: "Profile updated", user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, skill: user.skill } });
    } catch (error) {
        res.status(500).json({ message: "Could not update profile" });
    }
}

module.exports = { signup, login, updateProfile };
