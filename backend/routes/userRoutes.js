const express = require("express");
const router = express.Router();
const {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/", registerUser);
router.post("/login", authUser);
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);
router.put("/password", protect, changePassword);

module.exports = router;
