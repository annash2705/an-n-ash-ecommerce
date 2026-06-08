const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const Order = require("../models/Order");
require("dotenv").config();

// Set fallback DNS resolver for local development to avoid querySrv ECONNREFUSED with MongoDB Atlas
const dns = require("dns");
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
    console.warn("Failed to set DNS servers:", e.message);
}

const migrateData = async () => {
    try {
        await connectDB();
        console.log("Connected to database for migration...");

        // 1. Migrate Products
        console.log("Migrating products...");
        const products = await Product.find({ shippingConfig: { $exists: false } });
        console.log(`Found ${products.length} products needing migration.`);
        
        let productCount = 0;
        for (const product of products) {
            product.shippingConfig = {
                weight: 0.1, // 100 grams
                length: 10,
                width: 10,
                height: 10,
                fragile: false,
                requiresSpecialPackaging: false,
                shippingClass: "Standard",
                hsnCode: "711319",
                countryOfOrigin: "India"
            };
            await product.save();
            productCount++;
        }
        console.log(`Successfully migrated ${productCount} products.`);

        // 2. Migrate Orders
        console.log("Migrating orders...");
        const orders = await Order.find({});
        console.log(`Found ${orders.length} total orders to check.`);

        let orderCount = 0;
        for (const order of orders) {
            let updated = false;

            // Initialize timeline if empty
            if (!order.orderTimeline || order.orderTimeline.length === 0) {
                const timeline = [];
                const createdAt = order.createdAt || new Date();
                
                // Add "order placed"
                timeline.push({
                    status: "order placed",
                    timestamp: createdAt,
                    description: "Order has been placed successfully."
                });

                // Add subsequent statuses based on orderStatus
                const statuses = ["processing", "packed", "shipped", "out for delivery", "delivered"];
                const currentIdx = statuses.indexOf(order.orderStatus);
                
                if (currentIdx >= 0) {
                    for (let i = 0; i <= currentIdx; i++) {
                        const statusTime = new Date(createdAt.getTime() + (i + 1) * 3600000); // 1 hour intervals
                        timeline.push({
                            status: statuses[i],
                            timestamp: statusTime,
                            description: `Order status updated to ${statuses[i]}.`
                        });
                    }
                } else if (order.orderStatus === "cancelled") {
                    timeline.push({
                        status: "cancelled",
                        timestamp: new Date(createdAt.getTime() + 1800000), // 30 mins later
                        description: "Order was cancelled."
                    });
                }
                
                order.orderTimeline = timeline;
                updated = true;
            }

            // Set default returnDetails if empty
            if (!order.returnDetails || !order.returnDetails.refundStatus) {
                order.returnDetails = {
                    isRequested: false,
                    reason: "",
                    status: "Pending",
                    refundStatus: "N/A",
                    refundAmount: 0
                };
                updated = true;
            }

            if (updated) {
                await order.save();
                orderCount++;
            }
        }
        console.log(`Successfully updated ${orderCount} orders.`);

        // 3. Migrate Settings
        console.log("Migrating settings...");
        const Settings = require("../models/Settings");
        let shippingSettings = await Settings.findOne({ key: "shippingSettings" });
        if (!shippingSettings) {
            shippingSettings = new Settings({
                key: "shippingSettings",
                value: {
                    rule: "threshold",
                    freeShippingThreshold: 999,
                    defaultWeight: 0.1,
                    defaultLength: 10,
                    defaultWidth: 10,
                    defaultHeight: 10,
                    expressDeliveryEnabled: true,
                    expressDeliveryCharges: 150,
                    codAvailable: true,
                    pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || "Home",
                    preferredCouriers: []
                }
            });
            await shippingSettings.save();
            console.log("Created default shippingSettings.");
        } else {
            console.log("shippingSettings already exists.");
        }

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrateData();
