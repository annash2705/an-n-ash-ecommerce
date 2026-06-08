const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
require("dotenv").config();

// Set fallback DNS resolver for local development to avoid querySrv ECONNREFUSED with MongoDB Atlas
const dns = require("dns");
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
    console.warn("Failed to set DNS servers:", e.message);
}

const seedMockData = async () => {
    try {
        await connectDB();
        console.log("Connected to database to seed mock order...");

        // 1. Find or Create Admin User (to own the product)
        let adminUser = await User.findOne({ isAdmin: true });
        if (!adminUser) {
            adminUser = new User({
                name: "Admin User",
                email: "admin@example.com",
                password: "password123",
                isAdmin: true,
                phone: "9999999999"
            });
            await adminUser.save();
            console.log("Created mock admin user: admin@example.com");
        } else {
            console.log(`Using existing admin user: ${adminUser.email}`);
        }

        // 2. Create or Find Mock Customer User
        let user = await User.findOne({ email: "customer@example.com" });
        if (!user) {
            user = new User({
                name: "Aditya Sharma",
                email: "customer@example.com",
                password: "password123",
                isAdmin: false,
                phone: "9876543210"
            });
            await user.save();
            console.log("Created mock customer user: Aditya Sharma (customer@example.com)");
        } else {
            console.log("Using existing mock customer user.");
        }

        // 3. Create or Find Mock Product with custom Shipping Config
        let product = await Product.findOne({ name: "Aura Gold Band" });
        if (!product) {
            product = new Product({
                user: adminUser._id,
                name: "Aura Gold Band",
                price: 4999,
                description: "A premium 22kt handmade gold band with minimalist engraving.",
                materials: "22kt Gold",
                images: [
                    {
                        url: "/images/aura-gold-band.jpg",
                        public_id: "aura-gold-band"
                    }
                ],
                category: "Rings",
                countInStock: 15,
                rating: 4.8,
                numReviews: 10,
                shippingConfig: {
                    weight: 0.25, // 250 grams
                    length: 12,   // 12 cm
                    width: 10,    // 10 cm
                    height: 8,    // 8 cm
                    fragile: true,
                    requiresSpecialPackaging: true,
                    shippingClass: "Premium",
                    hsnCode: "711319",
                    countryOfOrigin: "India"
                }
            });
            await product.save();
            console.log("Created mock product: Aura Gold Band (250g, 12x10x8cm)");
        } else {
            console.log("Using existing mock product.");
        }

        // 4. Create Mock Order awaiting fulfillment (paid, no shipmentId)
        const mockOrder = new Order({
            user: user._id,
            orderItems: [
                {
                    name: product.name,
                    qty: 1,
                    image: product.images[0]?.url || "/images/aura-gold-band.jpg",
                    price: product.price,
                    product: product._id
                }
            ],
            shippingAddress: {
                name: "Aditya Sharma",
                phone: "9876543210",
                email: "customer@example.com",
                street: "Flat 402, Royal Residency, Linking Road, Bandra West",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400050",
                country: "India"
            },
            paymentMethod: "Razorpay",
            paymentResult: {
                id: "pay_mock_12345",
                status: "success",
                update_time: new Date().toISOString(),
                email_address: "customer@example.com"
            },
            itemsPrice: product.price,
            shippingPrice: 0,
            totalPrice: product.price,
            isPaid: true,
            paidAt: Date.now(),
            orderStatus: "order placed",
            orderTimeline: [
                {
                    status: "order placed",
                    timestamp: new Date(),
                    description: "Order has been placed successfully. Payment verified."
                }
            ],
            returnDetails: {
                isRequested: false,
                reason: "",
                status: "Pending",
                refundStatus: "N/A",
                refundAmount: 0
            }
        });

        await mockOrder.save();
        console.log(`Created mock order awaiting fulfillment! Order ID: ${mockOrder._id}`);
        console.log("This order will now appear under 'Pending Shipments' in the Admin Shipping Dashboard.");

        process.exit(0);
    } catch (error) {
        console.error("Failed to seed mock order:", error);
        process.exit(1);
    }
};

seedMockData();
