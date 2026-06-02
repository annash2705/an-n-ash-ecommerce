const Settings = require("../models/Settings");

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
    try {
        const settings = await Settings.find({});
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update or create a setting by key
// @route   PUT /api/settings/:key
// @access  Private/Admin
const updateSetting = async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;

    try {
        let setting = await Settings.findOne({ key });
        if (setting) {
            setting.value = value;
            await setting.save();
        } else {
            setting = new Settings({ key, value });
            await setting.save();
        }
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getSettings,
    updateSetting,
};
