const mongoose = require("mongoose");

const customRequestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        jewelryType: {
            type: String,
            required: true,
            enum: ["Necklace", "Earrings", "Arm Cuff", "Ring", "Hair Accessory", "Other"],
        },
        description: {
            type: String,
            required: true,
        },
        referenceImage: {
            url: { type: String },
            public_id: { type: String },
        },
        budgetRange: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Reviewed", "Accepted", "Rejected", "Completed"],
            default: "Pending"
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("CustomRequest", customRequestSchema);
