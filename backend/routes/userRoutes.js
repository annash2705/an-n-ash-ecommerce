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

router.post("/", registerUser);
router.post("/login", authUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-email-code", resendEmailCode);
router.post("/send-phone-otp", sendPhoneOtp);
router.post("/verify-phone", verifyPhone);
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);
router.put("/password", protect, changePassword);

// Addresses routes
router.post("/addresses", protect, addAddress);
router.delete("/addresses/:id", protect, deleteAddress);
router.put("/addresses/:id/default", protect, setDefaultAddress);

module.exports = router;
