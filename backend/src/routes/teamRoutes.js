const express = require("express");
const { getTeams, getTeam, createTeam, updateTeam, deleteTeam, getPendingStudents, generateTeams, joinTeam } = require("../controllers/teamController");
const { protect, organizerOnly, studentOnly } = require("../middleware/auth");
const router = express.Router();

router.get("/", getTeams);
router.get("/pending", protect, organizerOnly, getPendingStudents);
router.post("/generate", protect, organizerOnly, generateTeams);
router.post("/", protect, organizerOnly, createTeam);
router.get("/:id", getTeam);
router.put("/:id", protect, organizerOnly, updateTeam);
router.delete("/:id", protect, organizerOnly, deleteTeam);
router.post("/:id/join", protect, studentOnly, joinTeam);

module.exports = router;
