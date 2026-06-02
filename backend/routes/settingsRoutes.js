const express = require("express");
const router = express.Router();
const { getSettings, updateSetting } = require("../controllers/settingsController");
const { protect, admin } = require("../middlewares/authMiddleware");

router.route("/").get(protect, admin, getSettings);
router.route("/:key").put(protect, admin, updateSetting);

module.exports = router;
