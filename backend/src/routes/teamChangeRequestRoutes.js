const express = require("express");
const {
    createRequest,
    getMyRequest,
    getRequests,
    getRequest,
    updateRequest,
    deleteRequest
} = require("../controllers/teamChangeRequestController");
const { protect, organizerOnly, studentOnly } = require("../middleware/auth");
const router = express.Router();

router.post("/", protect, studentOnly, createRequest);
router.get("/mine", protect, studentOnly, getMyRequest);
router.get("/", protect, organizerOnly, getRequests);
router.get("/:id", protect, getRequest);
router.put("/:id", protect, organizerOnly, updateRequest);
router.patch("/:id", protect, organizerOnly, updateRequest);
router.delete("/:id", protect, deleteRequest);

module.exports = router;
