const express = require("express");
const {
    listHackathons,
    createHackathon,
    joinHackathon,
    updateHackathonStatus
} = require("../controllers/hackathonController");
const { protect, organizerOnly, studentOnly } = require("../middleware/auth");
const router = express.Router();

router.get("/", protect, listHackathons);
router.post("/", protect, organizerOnly, createHackathon);
router.post("/:id/join", protect, studentOnly, joinHackathon);
router.patch("/:id/status", protect, organizerOnly, updateHackathonStatus);

module.exports = router;
