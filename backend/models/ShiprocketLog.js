const mongoose = require("mongoose");

const shiprocketLogSchema = new mongoose.Schema(
    {
        endpoint: { type: String, required: true },
        method: { type: String, required: true },
        requestPayload: { type: mongoose.Schema.Types.Mixed },
        responsePayload: { type: mongoose.Schema.Types.Mixed },
        statusCode: { type: Number },
        status: { type: String, enum: ["Success", "Failed"], required: true },
        errorMessage: { type: String },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ShiprocketLog", shiprocketLogSchema);
