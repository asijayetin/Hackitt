const express = require("express");
const {
    createRequest,
    getMyRequest,
    getRequests,
    updateRequest
} = require("../controllers/teamChangeRequestController");
const { protect, organizerOnly, studentOnly } = require("../middleware/auth");
const router = express.Router();

router.post("/", protect, studentOnly, createRequest);
router.get("/mine", protect, studentOnly, getMyRequest);
router.get("/", protect, organizerOnly, getRequests);
router.patch("/:id", protect, organizerOnly, updateRequest);

module.exports = router;
