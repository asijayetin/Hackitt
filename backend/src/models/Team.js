const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", default: null },
    name: { type: String, required: true },
    maxSize: { type: Number, required: true },
    members: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        email: String,
        skill: String
    }]
}, { timestamps: true });

module.exports = mongoose.model("Team", teamSchema);
