require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

// Connect to database
connectDB();

const app = express();

// CORS — support multiple origins
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

app.use(express.json());

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    message: { message: "Too many attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Basic Route
app.get("/", (req, res) => {
    res.send("An.n.Ash API is running...");
});

// Import Routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const orderRoutes = require("./routes/orderRoutes");
const customRequestRoutes = require("./routes/customRequestRoutes");
const { getRazorpayClientId } = require("./controllers/orderController");

// Mount Routes
app.use("/api/users", authLimiter, userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/custom-requests", customRequestRoutes);
app.get("/api/config/razorpay", getRazorpayClientId);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "API route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
