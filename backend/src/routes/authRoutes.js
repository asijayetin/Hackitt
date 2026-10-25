const express = require("express");
const { signup, login, getProfile, updateProfile, deleteProfile } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteProfile);

module.exports = router;
