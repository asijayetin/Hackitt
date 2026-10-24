const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema({
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    minTeamSize: { type: Number, required: true },
    maxTeamSize: { type: Number, required: true },
    requiredSkills: [{ type: String, trim: true }],
    prizePool: {
        first: { type: Number, default: 10000 },
        second: { type: Number, default: 5000 },
        third: { type: Number, default: 3000 }
    },
    status: { type: String, enum: ["open", "closed", "completed"], default: "open" },
    results: [{
        rank: Number,
        teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        teamName: String,
        prizeAmount: Number,
        members: [{ name: String, skill: String }]
    }],
    participants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: String,
        email: String,
        skill: String
    }]
}, { timestamps: true });

module.exports = mongoose.model("Hackathon", hackathonSchema);
