const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema({
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    minTeamSize: { type: Number, required: true },
    maxTeamSize: { type: Number, required: true },
    requiredSkills: [{ type: String, trim: true }],
    status: { type: String, enum: ["open", "closed"], default: "open" },
    participants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: String,
        email: String,
        skill: String
    }]
}, { timestamps: true });

module.exports = mongoose.model("Hackathon", hackathonSchema);
