const CustomRequest = require("../models/CustomRequest");

// @desc    Submit a custom jewelry request
// @route   POST /api/custom-requests
// @access  Public
const submitCustomRequest = async (req, res) => {
    const { name, email, phone, jewelryType, description, imageBlob, budgetRange } = req.body;

    try {
        const customReq = new CustomRequest({
            name,
            email,
            phone,
            jewelryType,
            description,
            budgetRange,
            referenceImage: imageBlob ? { url: imageBlob.url, public_id: imageBlob.public_id } : {},
        });

        const createdReq = await customReq.save();
        res.status(201).json(createdReq);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all custom requests
// @route   GET /api/custom-requests
// @access  Private/Admin
const getCustomRequests = async (req, res) => {
    try {
        const requests = await CustomRequest.find({}).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update custom request status
// @route   PUT /api/custom-requests/:id/status
// @access  Private/Admin
const updateCustomRequestStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const customReq = await CustomRequest.findById(req.params.id);

        if (customReq) {
            customReq.status = status;
            const updatedReq = await customReq.save();
            res.json(updatedReq);
        } else {
            res.status(404).json({ message: "Custom Request not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    submitCustomRequest,
    getCustomRequests,
    updateCustomRequestStatus,
};
