const express = require("express");
const cors = require("cors");
const path = require("path");

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

const projectRoot = path.resolve(__dirname, "../..");
app.use("/css", express.static(path.join(projectRoot, "css")));
app.use("/js", express.static(path.join(projectRoot, "js")));
app.use("/assets", express.static(path.join(projectRoot, "assets")));
app.use(express.static(path.join(projectRoot, "Frontend")));

app.use(function (err, req, res, next) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
});

module.exports = app;
