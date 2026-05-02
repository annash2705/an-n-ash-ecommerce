const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        orderItems: [
            {
                name: { type: String, required: true },
                qty: { type: Number, required: true },
                image: { type: String, default: "https://via.placeholder.com/150" },
                price: { type: Number, required: true },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "Product",
                },
            },
        ],
        shippingAddress: {
            name: { type: String, required: true },
            phone: { type: String, required: true },
            email: { type: String, required: true },
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        paymentResult: {
            id: { type: String },
            status: { type: String },
            update_time: { type: String },
            email_address: { type: String },
        },
        itemsPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        orderStatus: {
            type: String,
            enum: ["order placed", "processing", "packed", "shipped", "out for delivery", "delivered", "cancelled"],
            default: "order placed",
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
        trackingId: {
            type: String,
        },
        shipmentId: {
            type: String,
        },
        shiprocketOrderId: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Order", orderSchema);
