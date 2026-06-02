const express = require("express");
const router = express.Router();
const {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    verifyEmail,
    resendEmailCode,
    sendPhoneOtp,
    verifyPhone,
    addAddress,
    deleteAddress,
    setDefaultAddress
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const authLimiter = require("../middlewares/rateLimiter");

router.post("/", authLimiter, registerUser);
router.post("/login", authLimiter, authUser);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/resend-email-code", authLimiter, resendEmailCode);
router.post("/send-phone-otp", authLimiter, sendPhoneOtp);
router.post("/verify-phone", authLimiter, verifyPhone);
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);
router.put("/password", protect, changePassword);

// Addresses routes
router.post("/addresses", protect, addAddress);
router.delete("/addresses/:id", protect, deleteAddress);
router.put("/addresses/:id/default", protect, setDefaultAddress);

module.exports = router;
