const mongoose = require("mongoose");

const teamChangeRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    currentTeamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    currentTeamName: { type: String, required: true },
    newTeamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    newTeamName: String,
    reason: { type: String, required: true, trim: true, maxlength: 300 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("TeamChangeRequest", teamChangeRequestSchema);
