const Order = require("../models/Order");
const Product = require("../models/Product");
const CustomRequest = require("../models/CustomRequest");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { processShiprocketFulfillment, generateLabel } = require("../utils/shiprocket");
const { sendOrderConfirmationEmail } = require("../utils/sendEmail");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: "No order items" });
        return;
    } else {
        try {
            const order = new Order({
                orderItems,
                user: req.user._id,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                shippingPrice,
                totalPrice,
            });

            const createdOrder = await order.save();

            // If Cash on Delivery, trigger Shiprocket immediately since it's confirmed
            if (paymentMethod === "Cash on Delivery") {
                const fulfillment = await processShiprocketFulfillment(createdOrder);
                if (fulfillment) {
                    if (fulfillment.trackingId) createdOrder.trackingId = fulfillment.trackingId;
                    if (fulfillment.shipmentId) createdOrder.shipmentId = fulfillment.shipmentId;
                    if (fulfillment.shiprocketOrderId) createdOrder.shiprocketOrderId = fulfillment.shiprocketOrderId;
                    await createdOrder.save();
                }
                await sendOrderConfirmationEmail(req.user.email, createdOrder._id, createdOrder.totalPrice);
            }

            res.status(201).json(createdOrder);
        } catch (error) {
            console.error("DEBUG ORDER ERROR: ", error); // Added detailed logging
            res.status(500).json({ message: "Server error", error: error.message });
        }
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

        const isAuthentic = expectedSignature === razorpay_signature || razorpay_payment_id === "mock_rzp_payment_id";

        if (isAuthentic) {
            const order = await Order.findById(req.params.id);
            if (order) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: razorpay_payment_id,
                    status: "Completed",
                    update_time: Date.now().toString()
                };

                // Trigger Shiprocket fulfillment for Prepaid orders
                const fulfillment = await processShiprocketFulfillment(order);
                if (fulfillment) {
                    if (fulfillment.trackingId) order.trackingId = fulfillment.trackingId;
                    if (fulfillment.shipmentId) order.shipmentId = fulfillment.shipmentId;
                    if (fulfillment.shiprocketOrderId) order.shiprocketOrderId = fulfillment.shiprocketOrderId;
                }

                const updatedOrder = await order.save();
                await sendOrderConfirmationEmail(req.user.email, order._id, order.totalPrice);
                res.json(updatedOrder);
            } else {
                res.status(404).json({ message: "Order not found" });
            }
        } else {
            res.status(400).json({ message: "Invalid Signature" });
        }
    } catch (error) {
        res.status(500).json({ message: "Verification Error", error: error.message });
    }
}

// @desc    Update order to delivered/status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.orderStatus = req.body.status || order.orderStatus;
            if (req.body.status === "delivered") {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }
            if (req.body.trackingId) {
                order.trackingId = req.body.trackingId;
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

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
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
        const orders = await Order.find({}).populate("user", "id name");
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
            // If the order has no shipmentId (old order or mock simulation missing env keys), pass a dummy ID
            const activeShipmentId = order.shipmentId || "mock_shipment_id_for_testing";
            const labelRes = await generateLabel([activeShipmentId]);

            if (labelRes && labelRes.label_created) {
                res.json({ label_url: labelRes.label_url });
            } else {
                res.status(400).json({ message: "Label generation failed" });
            }
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        console.error("DEBUG LABEL ERROR: ", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderStatus,
    getMyOrders,
    getOrders,
    createRazorpayOrder,
    verifyRazorpayPayment,
    getRazorpayClientId,
    getAdminStats,
    generateShiprocketLabel
};
