const express = require("express");
const {
    listHackathons,
    getHackathon,
    createHackathon,
    updateHackathon,
    deleteHackathon,
    joinHackathon,
    updateHackathonStatus,
    saveHackathonResults
} = require("../controllers/hackathonController");
const { protect, organizerOnly, studentOnly } = require("../middleware/auth");
const router = express.Router();

router.get("/", protect, listHackathons);
router.get("/:id", protect, getHackathon);
router.post("/", protect, organizerOnly, createHackathon);
router.put("/:id", protect, organizerOnly, updateHackathon);
router.delete("/:id", protect, organizerOnly, deleteHackathon);
router.post("/:id/join", protect, studentOnly, joinHackathon);
router.patch("/:id/status", protect, organizerOnly, updateHackathonStatus);
router.patch("/:id/results", protect, organizerOnly, saveHackathonResults);

module.exports = router;
