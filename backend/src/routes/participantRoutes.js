const express = require("express");
const { getParticipants } = require("../controllers/participantController");
const { protect, organizerOnly } = require("../middleware/auth");
const router = express.Router();

router.get("/", protect, organizerOnly, getParticipants);

module.exports = router;
