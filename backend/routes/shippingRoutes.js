const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const Settings = require("../models/Settings");
const ShiprocketLog = require("../models/ShiprocketLog");
const { protect, admin } = require("../middlewares/authMiddleware");
const { calculateShippingRates, getTrackingDetails } = require("../utils/shiprocket");
const { sendShippingNotification } = require("../utils/notifications");

// @desc    Calculate shipping rates for a pincode
// @route   POST /api/shipping/calculate-rates
// @access  Private
router.post("/calculate-rates", protect, async (req, res) => {
    const { pincode, items, paymentMethod } = req.body;

    if (!pincode || !items || items.length === 0) {
        return res.status(400).json({ message: "Pincode and cart items are required." });
    }

    try {
        const result = await calculateShippingRates(pincode, items, paymentMethod);

        if (!result.serviceable || result.rates.length === 0) {
            return res.json({
                serviceable: false,
                rates: [],
                message: "This location is not serviceable by our courier partners."
            });
        }

        // Fetch our database shippingSettings to apply pricing rules
        let shippingSettings = {
            rule: "full",
            freeShippingThreshold: 999,
            expressDeliveryEnabled: true,
            expressDeliveryCharges: 150
        };
        const settingsDoc = await Settings.findOne({ key: "shippingSettings" });
        if (settingsDoc && settingsDoc.value) {
            shippingSettings = { ...shippingSettings, ...settingsDoc.value };
        }

        // Subtotal of items
        const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

        // Map courier rates and apply settings rules
        const formattedRates = result.rates.map(courier => {
            const baseCharge = Number(courier.rate);
            let charge = baseCharge;

            if (shippingSettings.rule === "free") {
                charge = 0;
            } else if (shippingSettings.rule === "threshold" && subtotal >= shippingSettings.freeShippingThreshold) {
                charge = 0;
            } else if (shippingSettings.rule === "partial") {
                // Charge half of shipping cost
                charge = Math.round(baseCharge / 2);
            }

            // Determine speed type based on courier SLA
            const deliveryDays = Number(courier.etd_hours) / 24;
            let type = "Standard Delivery";
            if (deliveryDays <= 2) {
                type = "Express Delivery";
                if (shippingSettings.expressDeliveryEnabled) {
                    charge += shippingSettings.expressDeliveryCharges;
                }
            } else if (deliveryDays > 5) {
                type = "Economy Delivery";
            }

            return {
                courierId: courier.courier_company_id,
                name: courier.courier_name,
                rating: Number(courier.ratings) || 4.0,
                deliveryDays: Math.ceil(deliveryDays) || 3,
                cost: charge,
                originalCost: baseCharge,
                type,
                codAvailable: courier.cod === 1
            };
        });

        // Sort by cost ascending
        formattedRates.sort((a, b) => a.cost - b.cost);

        res.json({
            serviceable: true,
            rates: formattedRates
        });

    } catch (error) {
        console.error("Calculate rates API error:", error.message);
        res.status(500).json({ message: "Server error during rate calculation", error: error.message });
    }
});

// @desc    Get delivery analytics
// @route   GET /api/shipping/analytics
// @access  Private/Admin
router.get("/analytics", protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({});
        
        let totalShipments = 0;
        let deliveredOrders = 0;
        let failedDeliveries = 0;
        let returnRateCount = 0;
        let totalShippingRevenue = 0;
        let totalShippingExpenses = 0;
        let totalDeliveryTimeMs = 0;
        let ordersWithTimeCount = 0;

        for (const order of orders) {
            // Count shipments
            if (order.shipmentId) {
                totalShipments++;
            }

            // Status counts
            if (order.orderStatus === "delivered") {
                deliveredOrders++;
                if (order.deliveredAt && order.createdAt) {
                    totalDeliveryTimeMs += (new Date(order.deliveredAt).getTime() - new Date(order.createdAt).getTime());
                    ordersWithTimeCount++;
                }
            } else if (order.orderStatus === "cancelled" && order.shipmentId) {
                failedDeliveries++;
            } else if (order.orderStatus === "returned" || order.orderStatus === "return requested") {
                returnRateCount++;
            }

            // Shipping finances
            totalShippingRevenue += order.shippingPrice || 0;
            // Shiprocket API logs can give us approximate actual charges, or we estimate expenses at 85% of standard rate
            if (order.shipmentId) {
                totalShippingExpenses += Math.round((order.shippingPrice || 80) * 0.85);
            }
        }

        const averageDeliveryTimeDays = ordersWithTimeCount > 0 
            ? Math.round((totalDeliveryTimeMs / ordersWithTimeCount) / (1000 * 60 * 60 * 24) * 10) / 10 
            : 3.5;

        const returnRate = totalShipments > 0 ? Math.round((returnRateCount / totalShipments) * 100) : 0;

        // Fetch logs
        const logs = await ShiprocketLog.find({}).sort({ createdAt: -1 }).limit(10).populate("orderId", "shippingAddress.name");

        res.json({
            totalShipments,
            deliveredOrders,
            failedDeliveries,
            returnRate,
            averageDeliveryTime: averageDeliveryTimeDays,
            shippingRevenue: totalShippingRevenue,
            shippingExpenses: totalShippingExpenses,
            recentLogs: logs.map(l => ({
                id: l._id,
                endpoint: l.endpoint,
                method: l.method,
                status: l.status,
                statusCode: l.statusCode,
                timestamp: l.createdAt,
                customer: l.orderId?.shippingAddress?.name || "N/A"
            }))
        });
    } catch (error) {
        console.error("Delivery analytics API error:", error.message);
        res.status(500).json({ message: "Server error fetching analytics", error: error.message });
    }
});

// @desc    Shiprocket Status Webhook Receiver
// @route   POST /api/shipping/webhook
// @access  Public
router.post("/webhook", async (req, res) => {
    const payload = req.body;

    try {
        // Log Webhook Inbound Payload for auditing
        await ShiprocketLog.create({
            endpoint: "/shipping/webhook",
            method: "POST",
            requestPayload: payload,
            responsePayload: { message: "Webhook acknowledged" },
            statusCode: 200,
            status: "Success",
            errorMessage: null
        });

        const awbCode = payload.awb || payload.awb_code;
        const currentStatus = (payload.current_status || payload.status || "").toLowerCase().trim();

        if (!awbCode) {
            return res.status(400).json({ message: "AWB code is missing in webhook payload" });
        }

        // Find order by trackingId (AWB) or reverseAwbCode
        let order = await Order.findOne({ trackingId: awbCode });
        let isReverse = false;

        if (!order) {
            order = await Order.findOne({ "returnDetails.reverseAwbCode": awbCode });
            if (order) isReverse = true;
        }

        if (!order) {
            console.warn(`Webhook received for untracked AWB: ${awbCode}`);
            return res.status(200).json({ message: "AWB not found in system, but payload logged." });
        }

        // Map Shiprocket status string to local status
        let localStatus = "";
        let eventType = "";
        let description = "";

        if (!isReverse) {
            // Forward Shipment
            if (["picked up", "pickup completed", "shipped"].includes(currentStatus)) {
                localStatus = "shipped";
                eventType = "pickup_completed";
                description = "Package has been picked up by the courier partner.";
            } else if (["in transit", "reached hub", "customs clearance"].includes(currentStatus)) {
                localStatus = "shipped";
                eventType = "in_transit";
                description = "Package is in transit towards your city hub.";
            } else if (["out for delivery", "outfordelivery"].includes(currentStatus)) {
                localStatus = "out for delivery";
                eventType = "out_for_delivery";
                description = "Package is out for delivery today.";
            } else if (["delivered", "completed"].includes(currentStatus)) {
                localStatus = "delivered";
                eventType = "delivered";
                description = "Package has been successfully delivered.";
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            } else if (["cancelled", "canceled"].includes(currentStatus)) {
                localStatus = "cancelled";
                eventType = "cancelled";
                description = "Shipment was cancelled.";
            }
        } else {
            // Reverse Shipment
            if (["picked up", "pickup completed", "shipped"].includes(currentStatus)) {
                order.returnDetails.status = "Pickup Scheduled";
                eventType = "return_approved";
                description = "Reverse pickup has been completed.";
            } else if (["delivered", "completed", "returned"].includes(currentStatus)) {
                order.returnDetails.status = "Completed";
                localStatus = "returned";
                eventType = "returned";
                description = "Returned package has been received and inspected at warehouse.";
                
                // Set refund status as completed
                order.returnDetails.refundStatus = "Refunded";
                order.returnDetails.refundAmount = order.totalPrice;
                order.returnDetails.resolvedAt = Date.now();
            }
        }

        if (localStatus) {
            order.orderStatus = localStatus;
        }

        // Push to orderTimeline if description was mapped
        if (description) {
            order.orderTimeline.push({
                status: localStatus || order.orderStatus,
                timestamp: new Date(),
                description
            });
        }

        await order.save();

        // Trigger notifications
        if (eventType) {
            await sendShippingNotification(order, eventType);
        }

        res.status(200).json({ message: "Webhook processed successfully" });

    } catch (err) {
        console.error("Shiprocket webhook error:", err.message);
        res.status(500).json({ message: "Internal server error processing webhook" });
    }
});

module.exports = router;
