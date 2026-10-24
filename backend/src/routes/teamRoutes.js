const express = require("express");
const { getTeams, getPendingStudents, generateTeams, joinTeam } = require("../controllers/teamController");
const { protect, organizerOnly, studentOnly } = require("../middleware/auth");
const router = express.Router();

router.get("/", getTeams);
router.get("/pending", protect, organizerOnly, getPendingStudents);
router.post("/generate", protect, organizerOnly, generateTeams);
router.post("/:id/join", protect, studentOnly, joinTeam);

module.exports = router;
