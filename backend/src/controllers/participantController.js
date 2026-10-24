const User = require("../models/User");

async function getParticipants(req, res) {
    try {
        const users = await User.find({ role: "student" }).select("firstName lastName email skill");
        const participants = users.map(function (user) {
            return { id: user._id, name: user.firstName + " " + user.lastName, email: user.email, skill: user.skill };
        });
        res.json(participants);
    } catch (error) {
        res.status(500).json({ message: "Could not get participants" });
    }
}

module.exports = { getParticipants };
