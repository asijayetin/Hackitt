const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const participantRoutes = require("./routes/participantRoutes");
const teamChangeRequestRoutes = require("./routes/teamChangeRequestRoutes");
const hackathonRoutes = require("./routes/hackathonRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", function (req, res) {
    res.json({ message: "Hackitt API is working" });
});

app.use("/api/auth", authRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/team-change-requests", teamChangeRequestRoutes);
app.use("/api/hackathons", hackathonRoutes);

app.use(function (err, req, res, next) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
});

module.exports = app;
