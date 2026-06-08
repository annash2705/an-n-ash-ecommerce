const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

const productSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        name: {
            type: String,
            required: true,
        },
        images: [
            {
                url: { type: String, required: true },
                public_id: { type: String, required: true },
            },
        ],
        description: {
            type: String,
            required: true,
        },
        materials: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ["Necklaces", "Earrings", "Arm Cuffs", "Hair Accessories", "Rings"],
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        countInStock: {
            type: Number,
            required: true,
            default: 0,
        },
        isHandmade: {
            type: Boolean,
            default: true
        },
        reviews: [reviewSchema],
        rating: {
            type: Number,
            required: true,
            default: 0,
        },
        numReviews: {
            type: Number,
            required: true,
            default: 0,
        },
        shippingConfig: {
            weight: { type: Number, default: 0.1 }, // in kg
            length: { type: Number, default: 10 },  // in cm
            width: { type: Number, default: 10 },   // in cm
            height: { type: Number, default: 10 },  // in cm
            fragile: { type: Boolean, default: false },
            requiresSpecialPackaging: { type: Boolean, default: false },
            shippingClass: { type: String, default: "Standard" },
            hsnCode: { type: String, default: "711319" }, // HSN for jewelry
            countryOfOrigin: { type: String, default: "India" }
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Product", productSchema);
