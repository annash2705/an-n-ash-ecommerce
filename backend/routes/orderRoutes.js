const express = require("express");
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    updateOrderStatus,
    getMyOrders,
    getOrders,
    createRazorpayOrder,
    verifyRazorpayPayment,
    getAdminStats,
    generateShiprocketLabel
} = require("../controllers/orderController");
const { protect, admin } = require("../middlewares/authMiddleware");

router.route("/").post(protect, addOrderItems).get(protect, admin, getOrders);
router.route("/myorders").get(protect, getMyOrders);
router.route("/stats/admin").get(protect, admin, getAdminStats);
router.route("/:id").get(protect, getOrderById);
router.route("/:id/pay").post(protect, createRazorpayOrder);
router.route("/:id/verify").post(protect, verifyRazorpayPayment);
router.route("/:id/status").put(protect, admin, updateOrderStatus);
router.route("/:id/generate-label").post(protect, admin, generateShiprocketLabel);

module.exports = router;
