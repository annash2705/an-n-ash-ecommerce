const Order = require("../models/Order");
const Product = require("../models/Product");
const CustomRequest = require("../models/CustomRequest");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Settings = require("../models/Settings");
const { 
    processShiprocketFulfillment, 
    generateLabel, 
    createReverseShipment, 
    getTrackingDetails 
} = require("../utils/shiprocket");
const { sendShippingNotification } = require("../utils/notifications");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper: Decrement stock for ordered items
const decrementStock = async (orderItems) => {
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
            product.countInStock = Math.max(0, product.countInStock - item.qty);
            await product.save();
        }
    }
};

// Helper: Restore stock for cancelled order items
const restoreStock = async (orderItems) => {
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
            product.countInStock += item.qty;
            await product.save();
        }
    }
};

// Helper: Automatically save address to user's profile if it's not already saved
const autoSaveAddress = async (userId, shippingAddress) => {
    try {
        const User = require("../models/User");
        const user = await User.findById(userId);
        if (!user) return;

        // Check if user already has an address with the same street, city, state, and pincode
        const isDuplicate = user.addresses.some(
            (addr) =>
                addr.street?.trim().toLowerCase() === shippingAddress.street?.trim().toLowerCase() &&
                addr.city?.trim().toLowerCase() === shippingAddress.city?.trim().toLowerCase() &&
                addr.state?.trim().toLowerCase() === shippingAddress.state?.trim().toLowerCase() &&
                addr.pincode?.trim().toLowerCase() === shippingAddress.pincode?.trim().toLowerCase()
        );

        if (!isDuplicate) {
            // Check if this is the first address, make it default if so
            const isFirst = user.addresses.length === 0;
            user.addresses.push({
                name: shippingAddress.name,
                phone: shippingAddress.phone,
                email: shippingAddress.email,
                street: shippingAddress.street,
                city: shippingAddress.city,
                state: shippingAddress.state,
                pincode: shippingAddress.pincode,
                country: shippingAddress.country || "India",
                isDefault: isFirst
            });
            await user.save();
        }
    } catch (err) {
        console.error("Failed to auto-save address:", err.message);
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
        idempotencyKey,
        courierId,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: "No order items" });
    }

    try {
        // Step 1: Check Idempotency Key
        if (idempotencyKey) {
            const existingOrder = await Order.findOne({ idempotencyKey });
            if (existingOrder) {
                console.log(`[Idempotency Check] Duplicate checkout attempt blocked. Order ID: ${existingOrder._id}`);
                return res.status(200).json(existingOrder);
            }
        }

        // Step 2: Atomic stock check & reservation (concurrency safe)
        const reservedProducts = [];
        let stockCheckPassed = true;
        let stockErrorMessage = "";

        for (const item of orderItems) {
            const product = await Product.findOneAndUpdate(
                { _id: item.product, countInStock: { $gte: item.qty } },
                { $inc: { countInStock: -item.qty } },
                { new: true }
            );

            if (!product) {
                stockCheckPassed = false;
                stockErrorMessage = `Insufficient stock or product not found: ${item.name}`;
                break;
            }
            reservedProducts.push({ product: item.product, qty: item.qty });
        }

        if (!stockCheckPassed) {
            // Rollback previously reserved items
            for (const resItem of reservedProducts) {
                await Product.findByIdAndUpdate(resItem.product, {
                    $inc: { countInStock: resItem.qty }
                });
            }
            return res.status(400).json({ message: stockErrorMessage });
        }

        // Create the order object
        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            idempotencyKey: idempotencyKey || undefined,
            courierId: courierId || undefined,
            orderTimeline: [{
                status: "order placed",
                timestamp: new Date(),
                description: "Order has been placed successfully."
            }]
        });

        const createdOrder = await order.save();

        // Auto-save address to user profile if it's unique
        await autoSaveAddress(req.user._id, shippingAddress);

        // Send order placed notification
        sendShippingNotification(createdOrder, "order_placed").catch(e => console.error(e));

        // If Cash on Delivery, trigger Shiprocket immediately since it's confirmed
        if (paymentMethod === "Cash on Delivery") {
            let isAutoShiprocket = true;
            try {
                const autoSRSetting = await Settings.findOne({ key: "autoShiprocket" });
                if (autoSRSetting && autoSRSetting.value === false) {
                    isAutoShiprocket = false;
                }
            } catch (err) {
                console.error("Failed to read settings, defaulting to true:", err.message);
            }

            if (isAutoShiprocket) {
                try {
                    // Pass the locked courier ID selected at checkout
                    const fulfillment = await processShiprocketFulfillment(createdOrder, createdOrder.courierId);
                    if (fulfillment) {
                        if (fulfillment.trackingId) createdOrder.trackingId = fulfillment.trackingId;
                        if (fulfillment.shipmentId) createdOrder.shipmentId = fulfillment.shipmentId;
                        if (fulfillment.shiprocketOrderId) createdOrder.shiprocketOrderId = fulfillment.shiprocketOrderId;
                        if (fulfillment.courierName) createdOrder.courierName = fulfillment.courierName;
                        if (fulfillment.trackingUrl) createdOrder.trackingUrl = fulfillment.trackingUrl;
                        createdOrder.orderStatus = "packed";
                        createdOrder.fulfillmentStatus = "fulfilled";

                        // Save in shipments array for production-grade audit
                        createdOrder.shipments.push({
                            shipmentId: fulfillment.shipmentId,
                            awbCode: fulfillment.trackingId,
                            courierName: fulfillment.courierName,
                            status: "packed",
                            shippedAt: new Date()
                        });

                        createdOrder.orderTimeline.push({
                            status: "packed",
                            timestamp: new Date(),
                            description: `Shipment created automatically with ${fulfillment.courierName}. AWB: ${fulfillment.trackingId}`
                        });
                        await createdOrder.save();

                        // Send shipment created notification
                        sendShippingNotification(createdOrder, "shipment_created").catch(e => console.error(e));
                    }
                } catch (srErr) {
                    console.error("Shiprocket failed during COD, but order is saved.", srErr.message);
                }
            } else {
                console.log("Automatic Shiprocket fulfillment is disabled (OFF). Skipping fulfillment for COD order.");
            }
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error("DEBUG ORDER ERROR: ", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            "user",
            "name email"
        );

        if (order && (req.user.isAdmin || order.user._id.equals(req.user._id))) {
            res.json(order);
        } else {
            res.status(404).json({ message: "Order not found or unauthorized" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Create Razorpay order
// @route   POST /api/orders/:id/pay
// @access  Private
const createRazorpayOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            const options = {
                amount: Math.round(order.totalPrice * 100), // amount in smallest currency unit (paise)
                currency: "INR",
                receipt: order._id.toString(),
            };
            const razorpayOrder = await razorpay.orders.create(options);
            res.json(razorpayOrder);
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Razorpay Error", error: error.message });
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/orders/:id/verify
// @access  Private
const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Concurrency Control: atomically mark order as paid to prevent duplicate processing
            let order = await Order.findOneAndUpdate(
                { _id: req.params.id, isPaid: false },
                {
                    $set: {
                        isPaid: true,
                        paidAt: Date.now(),
                        paymentResult: {
                            id: razorpay_payment_id,
                            status: "Completed",
                            update_time: Date.now().toString()
                        }
                    }
                },
                { new: true }
            );

            if (!order) {
                // If order was already paid, fetch and return it to prevent duplicate runs
                const checkOrder = await Order.findById(req.params.id);
                if (checkOrder && checkOrder.isPaid) {
                    console.log(`[Verify Payment] Payment already processed for order: ${req.params.id}`);
                    return res.json(checkOrder);
                }
                return res.status(404).json({ message: "Order not found" });
            }

            // Add payment verified timeline entry
            order.orderTimeline.push({
                status: "processing",
                timestamp: new Date(),
                description: "Payment verified successfully. Order processing."
            });

            // Send order placed notification
            sendShippingNotification(order, "order_placed").catch(e => console.error(e));

            // Check settings for automatic Shiprocket fulfillment
            let isAutoShiprocket = true;
            try {
                const autoSRSetting = await Settings.findOne({ key: "autoShiprocket" });
                if (autoSRSetting && autoSRSetting.value === false) {
                    isAutoShiprocket = false;
                }
            } catch (err) {
                console.error("Failed to read settings, defaulting to true:", err.message);
            }

            if (isAutoShiprocket) {
                try {
                    // Trigger Shiprocket fulfillment for Prepaid orders using checkout locked courier
                    const fulfillment = await processShiprocketFulfillment(order, order.courierId);
                    if (fulfillment) {
                        if (fulfillment.trackingId) order.trackingId = fulfillment.trackingId;
                        if (fulfillment.shipmentId) order.shipmentId = fulfillment.shipmentId;
                        if (fulfillment.shiprocketOrderId) order.shiprocketOrderId = fulfillment.shiprocketOrderId;
                        if (fulfillment.courierName) order.courierName = fulfillment.courierName;
                        if (fulfillment.trackingUrl) order.trackingUrl = fulfillment.trackingUrl;
                        order.orderStatus = "packed";
                        order.fulfillmentStatus = "fulfilled";

                        // Log shipment inside the database shipments array
                        order.shipments.push({
                            shipmentId: fulfillment.shipmentId,
                            awbCode: fulfillment.trackingId,
                            courierName: fulfillment.courierName,
                            status: "packed",
                            shippedAt: new Date()
                        });

                        order.orderTimeline.push({
                            status: "packed",
                            timestamp: new Date(),
                            description: `Shipment created automatically with ${fulfillment.courierName}. AWB: ${fulfillment.trackingId}`
                        });

                        // Send shipment created notification
                        sendShippingNotification(order, "shipment_created").catch(e => console.error(e));
                    }
                } catch (shiprocketErr) {
                    console.error("Shiprocket API failed during verification, but payment was captured:", shiprocketErr.message);
                }
            } else {
                console.log("Automatic Shiprocket fulfillment is disabled (OFF). Skipping fulfillment for Prepaid order.");
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(400).json({ message: "Invalid Signature" });
        }
    } catch (error) {
        res.status(500).json({ message: "Verification Error", error: error.message });
    }
};

// @desc    Update order to delivered/status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            const oldStatus = order.orderStatus;
            const newStatus = req.body.status || order.orderStatus;
            order.orderStatus = newStatus;
            
            if (newStatus === "delivered") {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }
            if (req.body.trackingId) {
                order.trackingId = req.body.trackingId;
            }

            // Append status transition description and push to timeline
            if (oldStatus !== newStatus) {
                let description = `Order status updated to ${newStatus}.`;
                let eventType = "";

                if (newStatus === "shipped") {
                    eventType = "pickup_completed";
                    description = "Package has been picked up by our courier partner and is on its way.";
                } else if (newStatus === "out for delivery") {
                    eventType = "out_for_delivery";
                    description = "Package is out for delivery today.";
                } else if (newStatus === "delivered") {
                    eventType = "delivered";
                    description = "Package has been successfully delivered.";
                } else if (newStatus === "cancelled") {
                    eventType = "cancelled";
                    description = "Order has been cancelled.";
                } else if (newStatus === "processing") {
                    description = "Order is currently being processed.";
                } else if (newStatus === "packed") {
                    description = "Order has been packed and is ready for pickup.";
                }

                order.orderTimeline.push({
                    status: newStatus,
                    timestamp: new Date(),
                    description
                });

                // Trigger notification in background
                if (eventType) {
                    sendShippingNotification(order, eventType).catch(e => console.error(e));
                }
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Only allow cancellation by order owner or admin
        if (!req.user.isAdmin && !order.user.equals(req.user._id)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Cannot cancel shipped/delivered orders
        if (["shipped", "out for delivery", "delivered"].includes(order.orderStatus)) {
            return res.status(400).json({ message: "Cannot cancel an order that has already been shipped or delivered." });
        }

        order.orderStatus = "cancelled";
        order.fulfillmentStatus = "cancelled";

        // Restore stock
        await restoreStock(order.orderItems);

        // Cancel order on Shiprocket if active shipment exists
        if (order.shiprocketOrderId) {
            const { cancelShiprocketOrder } = require("../utils/shiprocket");
            console.log(`Cancelling Shiprocket order: ${order.shiprocketOrderId}`);
            await cancelShiprocketOrder(order.shiprocketOrderId).catch(err => {
                console.error("Failed to cancel order on Shiprocket API:", err.message);
            });
            
            order.orderTimeline.push({
                status: "cancelled",
                timestamp: new Date(),
                description: `Order cancelled. Shiprocket cancellation request sent for Order ID: ${order.shiprocketOrderId}.`
            });
        } else {
            order.orderTimeline.push({
                status: "cancelled",
                timestamp: new Date(),
                description: "Order cancelled successfully."
            });
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate("user", "id name").sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get Razorpay Client ID
// @route   GET /api/config/razorpay
// @access  Public
const getRazorpayClientId = (req, res) => {
    res.send(process.env.RAZORPAY_KEY_ID);
};

// @desc    Get admin stats
// @route   GET /api/orders/stats/admin
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const orders = await Order.find({ isPaid: true });
        const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const pendingRequests = await CustomRequest.countDocuments({ status: "Pending" });

        res.json({
            totalSales,
            totalOrders,
            totalProducts,
            pendingRequests
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Generate Shiprocket Label
// @route   POST /api/orders/:id/generate-label
// @access  Private/Admin
const generateShiprocketLabel = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            if (!order.shipmentId) {
                return res.status(400).json({ message: "No active shipment ID for this order." });
            }
            const activeShipmentId = order.shipmentId;
            const labelRes = await generateLabel([activeShipmentId]);

            if (labelRes && labelRes.label_created) {
                res.json({ label_url: labelRes.label_url });
            } else {
                res.status(400).json({ message: labelRes?.message || "Shiprocket refused to create label. It might still be processing the AWB in the background." });
            }
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        console.error("DEBUG LABEL ERROR: ", error);
        res.status(500).json({ message: error.response?.data?.message || error.message || "Failed to generate label." });
    }
};

// @desc    Retry Shiprocket fulfillment for an order
// @route   POST /api/orders/:id/retry-fulfillment
// @access  Private/Admin
const retryShiprocketFulfillment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.shipmentId) {
            return res.status(400).json({ message: "Shipment already exists for this order." });
        }

        // Must be paid or Cash on Delivery
        if (order.paymentMethod === "Razorpay" && !order.isPaid) {
            return res.status(400).json({ message: "Cannot fulfill unpaid Razorpay order." });
        }

        const fulfillment = await processShiprocketFulfillment(order);
        if (fulfillment) {
            if (fulfillment.trackingId) order.trackingId = fulfillment.trackingId;
            if (fulfillment.shipmentId) order.shipmentId = fulfillment.shipmentId;
            if (fulfillment.shiprocketOrderId) order.shiprocketOrderId = fulfillment.shiprocketOrderId;
            if (fulfillment.courierName) order.courierName = fulfillment.courierName;
            if (fulfillment.trackingUrl) order.trackingUrl = fulfillment.trackingUrl;
            
            order.orderStatus = "packed";
            order.orderTimeline.push({
                status: "packed",
                timestamp: new Date(),
                description: `Shipment created via retry. Courier: ${fulfillment.courierName}. AWB: ${fulfillment.trackingId}`
            });

            const updatedOrder = await order.save();
            await sendShippingNotification(updatedOrder, "shipment_created");
            res.json(updatedOrder);
        } else {
            res.status(400).json({ message: "Shiprocket order creation returned empty response." });
        }
    } catch (error) {
        console.error("DEBUG RETRY FULFILLMENT ERROR: ", error);
        res.status(500).json({ message: error.message || "Shiprocket fulfillment failed." });
    }
};



// @desc    Customer request return
// @route   PUT /api/orders/:id/return-request
// @access  Private
const requestOrderReturn = async (req, res) => {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
        return res.status(400).json({ message: "Return reason is required." });
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        // Only owner can request return
        if (!order.user.equals(req.user._id) && !req.user.isAdmin) {
            return res.status(403).json({ message: "Not authorized." });
        }

        // Can only return delivered orders
        if (order.orderStatus !== "delivered") {
            return res.status(400).json({ message: "Only delivered orders can be returned." });
        }

        order.orderStatus = "return requested";
        order.returnDetails = {
            isRequested: true,
            reason,
            status: "Pending",
            requestedAt: Date.now(),
            refundStatus: "Pending"
        };

        order.orderTimeline.push({
            status: "return requested",
            timestamp: new Date(),
            description: `Return requested by customer. Reason: ${reason}`
        });

        const updatedOrder = await order.save();
        
        // Trigger notification
        await sendShippingNotification(updatedOrder, "return_requested");

        res.json(updatedOrder);
    } catch (error) {
        console.error("Return request error:", error.message);
        res.status(500).json({ message: "Server error requesting return", error: error.message });
    }
};

// @desc    Admin resolve return (Approve/Reject)
// @route   PUT /api/orders/:id/return-status
// @access  Private/Admin
const resolveOrderReturn = async (req, res) => {
    const { status, refundAmount } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ message: "Status must be Approved or Rejected." });
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        if (order.orderStatus !== "return requested") {
            return res.status(400).json({ message: "No active return request for this order." });
        }

        order.returnDetails.resolvedAt = Date.now();
        order.returnDetails.refundAmount = refundAmount || order.totalPrice;

        if (status === "Approved") {
            order.orderStatus = "return approved";
            order.returnDetails.status = "Approved";
            
            // Create Reverse Shipment in Shiprocket
            try {
                const reverseRes = await createReverseShipment(order, order.returnDetails.reason);
                if (reverseRes && reverseRes.shipment_id) {
                    order.returnDetails.reverseShipmentId = reverseRes.shipment_id;
                    order.returnDetails.reverseAwbCode = reverseRes.awb_code || "AWB-REV-" + order._id.toString().substring(0, 5).toUpperCase();
                    order.returnDetails.status = "Pickup Scheduled";
                    
                    order.orderTimeline.push({
                        status: "return approved",
                        timestamp: new Date(),
                        description: `Return approved. Reverse shipment created. AWB: ${order.returnDetails.reverseAwbCode}`
                    });
                } else {
                    order.orderTimeline.push({
                        status: "return approved",
                        timestamp: new Date(),
                        description: "Return approved. Shiprocket reverse shipment creation failed (offline fallback)."
                    });
                }
            } catch (srErr) {
                console.error("Failed to create reverse shipment in Shiprocket:", srErr.message);
                order.orderTimeline.push({
                    status: "return approved",
                    timestamp: new Date(),
                    description: "Return approved. (Failed to connect to Shiprocket API for reverse shipment)."
                });
            }

            const updatedOrder = await order.save();
            await sendShippingNotification(updatedOrder, "return_approved");
            res.json(updatedOrder);

        } else {
            // Rejected
            order.orderStatus = "return rejected";
            order.returnDetails.status = "Rejected";
            order.returnDetails.refundStatus = "N/A";

            order.orderTimeline.push({
                status: "return rejected",
                timestamp: new Date(),
                description: "Return request was rejected by admin."
            });

            const updatedOrder = await order.save();
            await sendShippingNotification(updatedOrder, "return_rejected");
            res.json(updatedOrder);
        }
    } catch (error) {
        console.error("Resolve return error:", error.message);
        res.status(500).json({ message: "Server error resolving return", error: error.message });
    }
};

// @desc    Admin create custom shipment with courier selection
// @route   POST /api/orders/:id/create-fulfillment-custom
// @access  Private/Admin
const createCustomFulfillment = async (req, res) => {
    const { courierId } = req.body;

    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        if (order.shipmentId) {
            return res.status(400).json({ message: "Shipment already exists for this order." });
        }

        const fulfillment = await processShiprocketFulfillment(order, courierId);
        if (fulfillment) {
            if (fulfillment.trackingId) order.trackingId = fulfillment.trackingId;
            if (fulfillment.shipmentId) order.shipmentId = fulfillment.shipmentId;
            if (fulfillment.shiprocketOrderId) order.shiprocketOrderId = fulfillment.shiprocketOrderId;
            if (fulfillment.courierName) order.courierName = fulfillment.courierName;
            if (fulfillment.trackingUrl) order.trackingUrl = fulfillment.trackingUrl;
            
            order.orderStatus = "packed";
            order.orderTimeline.push({
                status: "packed",
                timestamp: new Date(),
                description: `Shipment created via ${fulfillment.courierName || "selected courier"}. AWB: ${fulfillment.trackingId || "N/A"}`
            });

            const updatedOrder = await order.save();
            await sendShippingNotification(updatedOrder, "shipment_created");
            res.json(updatedOrder);
        } else {
            res.status(400).json({ message: "Fulfillment failed to return shipment ID." });
        }
    } catch (error) {
        console.error("Custom fulfillment error:", error.message);
        res.status(500).json({ message: "Server error during custom fulfillment", error: error.message });
    }
};

// @desc    Get real-time tracking details from Shiprocket and update order status
// @route   GET /api/orders/:id/track
// @access  Private
const trackAWBStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        const awbCode = order.trackingId || order.returnDetails?.reverseAwbCode;
        if (!awbCode) {
            return res.json({
                hasTracking: false,
                timeline: order.orderTimeline,
                status: order.orderStatus
            });
        }

        // Fetch real-time status from Shiprocket
        const trackingData = await getTrackingDetails(awbCode);
        if (trackingData && trackingData.tracking_data) {
            const trackInfo = trackingData.tracking_data;
            const shipmentTrack = trackInfo.shipment_track_activities || [];
            
            if (shipmentTrack.length > 0) {
                // Latest status
                const latestAct = shipmentTrack[0];
                const srStatus = (latestAct.status || "").toLowerCase().trim();
                
                let localStatus = "";
                let description = latestAct.activity || `Status updated to ${srStatus}`;

                if (["picked up", "pickup completed", "shipped"].includes(srStatus)) {
                    localStatus = "shipped";
                } else if (["in transit", "reached hub"].includes(srStatus)) {
                    localStatus = "shipped";
                } else if (["out for delivery", "outfordelivery"].includes(srStatus)) {
                    localStatus = "out for delivery";
                } else if (["delivered"].includes(srStatus)) {
                    localStatus = "delivered";
                    order.isDelivered = true;
                    order.deliveredAt = Date.now();
                }

                // If local status changed, update DB and push timeline
                if (localStatus && localStatus !== order.orderStatus) {
                    order.orderStatus = localStatus;
                    order.orderTimeline.push({
                        status: localStatus,
                        timestamp: new Date(latestAct.date),
                        description: `Shiprocket tracking update: ${description}`
                    });
                    await order.save();
                }
            }
        }

        res.json({
            hasTracking: true,
            trackingId: awbCode,
            courierName: order.courierName || "Shiprocket Partner",
            trackingUrl: order.trackingUrl || `https://shiprocket.co/tracking/${awbCode}`,
            timeline: order.orderTimeline,
            status: order.orderStatus,
            returnDetails: order.returnDetails
        });

    } catch (error) {
        console.error("Track AWB error:", error.message);
        res.status(500).json({ message: "Server error querying tracking", error: error.message });
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getMyOrders,
    getOrders,
    createRazorpayOrder,
    verifyRazorpayPayment,
    getRazorpayClientId,
    getAdminStats,
    generateShiprocketLabel,
    retryShiprocketFulfillment,
    requestOrderReturn,
    resolveOrderReturn,
    createCustomFulfillment,
    trackAWBStatus
};
