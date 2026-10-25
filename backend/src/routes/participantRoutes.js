const express = require("express");
const { getParticipants, getParticipant, createParticipant, updateParticipant, deleteParticipant } = require("../controllers/participantController");
const { protect, organizerOnly } = require("../middleware/auth");
const router = express.Router();

router.get("/", protect, organizerOnly, getParticipants);
router.post("/", protect, organizerOnly, createParticipant);
router.get("/:id", protect, organizerOnly, getParticipant);
router.put("/:id", protect, organizerOnly, updateParticipant);
router.delete("/:id", protect, organizerOnly, deleteParticipant);

module.exports = router;
