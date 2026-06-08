const mongoose = require("mongoose");

const shippingCacheSchema = new mongoose.Schema(
    {
        pincode: { type: String, required: true },
        pickupPostcode: { type: String, default: "500070" },
        weight: { type: Number, required: true },
        paymentMethod: { type: String, required: true },
        itemsHash: { type: String, required: true },
        rates: { type: mongoose.Schema.Types.Mixed, required: true },
        box: { type: mongoose.Schema.Types.Mixed, required: true }
    },
    {
        timestamps: true,
    }
);

// TTL index to automatically expire entries after 15 minutes (900 seconds)
shippingCacheSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });
shippingCacheSchema.index({ pincode: 1, pickupPostcode: 1, weight: 1, paymentMethod: 1, itemsHash: 1 });

module.exports = mongoose.model("ShippingCache", shippingCacheSchema);
