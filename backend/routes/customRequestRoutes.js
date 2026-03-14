const express = require("express");
const router = express.Router();
const {
    submitCustomRequest,
    getCustomRequests,
    updateCustomRequestStatus,
} = require("../controllers/customRequestController");
const { protect, admin } = require("../middlewares/authMiddleware");

router.route("/").post(submitCustomRequest).get(protect, admin, getCustomRequests);
router.route("/:id/status").put(protect, admin, updateCustomRequestStatus);

module.exports = router;
