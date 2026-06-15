const axios = require('axios');

const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in/v1/external';

let shiprocketToken = null;
let tokenExpiry = null;

const getShiprocketToken = async () => {
    try {
        const Settings = require("../models/Settings");

        // Try memory cache first
        if (shiprocketToken && tokenExpiry && Date.now() < tokenExpiry) {
            return shiprocketToken;
        }

        // Try database cache next
        const cached = await Settings.findOne({ key: "shiprocketToken" });
        if (cached && cached.value && cached.value.token && cached.value.expiry && Date.now() < cached.value.expiry) {
            shiprocketToken = cached.value.token;
            tokenExpiry = cached.value.expiry;
            return shiprocketToken;
        }

        console.log("Fetching fresh Shiprocket Auth Token from API...");
        const response = await axios.post(`${SHIPROCKET_API_BASE}/auth/login`, {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD,
        }, { timeout: 10000 });

        const token = response.data.token;
        const expiry = Date.now() + (9 * 24 * 60 * 60 * 1000); // 9 days

        await Settings.findOneAndUpdate(
            { key: "shiprocketToken" },
            { value: { token, expiry } },
            { upsert: true, new: true }
        );

        shiprocketToken = token;
        tokenExpiry = expiry;
        return shiprocketToken;
    } catch (error) {
        console.error("Error authenticating with Shiprocket (Timeout or Auth Failure)", error.message);
        throw new Error("Shiprocket Authentication failed");
    }
};

const executeWithRetry = async (fn, retries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === retries) throw error;
            console.warn(`Shiprocket API attempt ${attempt} failed. Retrying in ${delay}ms...`, error.message);
            await new Promise(res => setTimeout(res, delay));
            delay *= 2; // exponential backoff
        }
    }
};

const logShiprocketAction = async (endpoint, method, requestPayload, responsePayload, statusCode, orderId, errorMessage = null) => {
    try {
        const ShiprocketLog = require("../models/ShiprocketLog");
        const status = statusCode >= 200 && statusCode < 300 ? "Success" : "Failed";
        await ShiprocketLog.create({
            endpoint,
            method,
            requestPayload,
            responsePayload,
            statusCode,
            status,
            errorMessage,
            orderId: orderId || null
        });
    } catch (err) {
        console.error("Failed to write Shiprocket log to DB:", err.message);
    }
};

const calculateShippingRates = async (deliveryPincode, items, paymentMethod) => {
    try {
        const token = await getShiprocketToken();
        const Settings = require("../models/Settings");
        const Product = require("../models/Product");
        const ShippingCache = require("../models/ShippingCache");
        const crypto = require("crypto");

        // 1. Calculate items signature to check caching
        const sortedItems = [...items].sort((a, b) => a.product.toString().localeCompare(b.product.toString()));
        const itemsString = sortedItems.map(item => `${item.product}:${item.qty}`).join(",");
        const itemsHash = crypto.createHash("md5").update(itemsString).digest("hex");

        // 2. Load settings
        let settings = {
            pickupPostcode: "500070",
            pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || "Home",
            defaultWeight: 0.1
        };
        const settingsDoc = await Settings.findOne({ key: "shippingSettings" });
        if (settingsDoc && settingsDoc.value) {
            settings = { ...settings, ...settingsDoc.value };
        }

        // Force correct pickup pincode (Hyderabad) regardless of DB value
        settings.pickupPostcode = process.env.SHIPROCKET_PICKUP_POSTCODE || "500070";
        console.log(`[Shipping] Using pickup postcode: ${settings.pickupPostcode}`);

        // 3. Weight calculation: Sum of (product weight * quantity)
        let totalWeight = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            const qty = item.qty || 1;
            const shippingConfig = product?.shippingConfig || {};
            const itemWeight = (shippingConfig.weight || settings.defaultWeight) * qty;
            totalWeight += itemWeight;
        }

        totalWeight = Math.max(0.1, Math.round(totalWeight * 100) / 100); // min 100 grams, rounded to 2 decimals

        // Check if rates cache exists in DB (include pickup postcode in key)
        const cached = await ShippingCache.findOne({
            pincode: deliveryPincode,
            pickupPostcode: settings.pickupPostcode,
            weight: totalWeight,
            paymentMethod,
            itemsHash
        });

        // Predefined Box Sizes based on Total Weight (no summing of dimensions)
        const BOX_SIZES = [
            { name: "Small Box", length: 15, width: 15, height: 5, maxWeight: 0.5 },
            { name: "Medium Box", length: 25, width: 20, height: 10, maxWeight: 2.0 },
            { name: "Large Box", length: 35, width: 30, height: 20, maxWeight: 10.0 },
            { name: "Extra Large Box", length: 45, width: 40, height: 30, maxWeight: 30.0 }
        ];

        const selectBox = (weight) => {
            for (const box of BOX_SIZES) {
                if (weight <= box.maxWeight) return box;
            }
            return BOX_SIZES[BOX_SIZES.length - 1]; // fallback XL
        };

        const box = selectBox(totalWeight);

        if (cached) {
            console.log(`[Shipping Cache Hit] Pickup: ${settings.pickupPostcode} → Delivery: ${deliveryPincode}, Weight: ${totalWeight}kg`);
            return {
                serviceable: true,
                rates: cached.rates,
                weight: totalWeight,
                dimensions: cached.box
            };
        }

        const codVal = paymentMethod === "Cash on Delivery" ? 1 : 0;
        const url = `${SHIPROCKET_API_BASE}/courier/serviceability/?pickup_postcode=${settings.pickupPostcode}&delivery_postcode=${deliveryPincode}&weight=${totalWeight}&cod=${codVal}&length=${box.length}&width=${box.width}&height=${box.height}`;
        
        console.log(`[Shiprocket Serviceability] Fetching rates: ${url}`);
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            timeout: 8000
        });

        await logShiprocketAction(
            "/courier/serviceability/", 
            "GET", 
            { deliveryPincode, weight: totalWeight, cod: codVal, box }, 
            response.data, 
            response.status, 
            null
        );

        if (response.data && response.data.status === 200 && response.data.data) {
            const rates = response.data.data.available_courier_companies;
            
            // Cache the retrieved rates in MongoDB
            await ShippingCache.create({
                pincode: deliveryPincode,
                pickupPostcode: settings.pickupPostcode,
                weight: totalWeight,
                paymentMethod,
                itemsHash,
                rates,
                box
            });

            return {
                serviceable: true,
                rates,
                weight: totalWeight,
                dimensions: box
            };
        }

        return { serviceable: false, rates: [], weight: totalWeight, dimensions: box };
    } catch (error) {
        console.error("Error calculating shipping rates:", error.response ? JSON.stringify(error.response.data) : error.message);
        await logShiprocketAction(
            "/courier/serviceability/", 
            "GET", 
            { deliveryPincode, paymentMethod }, 
            error.response?.data, 
            error.response?.status, 
            null,
            error.message
        );
        
        // Fallback default box size
        return { serviceable: false, rates: [], weight: 0.5, dimensions: { length: 15, width: 15, height: 5 } };
    }
};

const createShiprocketOrder = async (orderDetails) => {
    try {
        const token = await getShiprocketToken();
        const Settings = require("../models/Settings");
        const Product = require("../models/Product");

        // Load shipping settings
        let settings = {
            pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || "Home",
            defaultWeight: 0.1
        };
        const settingsDoc = await Settings.findOne({ key: "shippingSettings" });
        if (settingsDoc && settingsDoc.value) {
            settings = { ...settings, ...settingsDoc.value };
        }

        // Calculate total weight and map items
        let totalWeight = 0;
        const orderItemsMapped = [];

        for (const item of orderDetails.orderItems) {
            const product = await Product.findById(item.product);
            const qty = item.qty || 1;
            const shippingConfig = product?.shippingConfig || {};
            const itemWeight = (shippingConfig.weight || settings.defaultWeight) * qty;
            totalWeight += itemWeight;

            orderItemsMapped.push({
                name: item.name,
                sku: item.product.toString(),
                units: qty,
                selling_price: item.price,
                discount: 0,
                tax: 0,
                hsn: shippingConfig.hsnCode || "711319"
            });
        }

        totalWeight = Math.max(0.1, Math.round(totalWeight * 100) / 100);

        // Predefined Box Sizing
        const BOX_SIZES = [
            { name: "Small Box", length: 15, width: 15, height: 5, maxWeight: 0.5 },
            { name: "Medium Box", length: 25, width: 20, height: 10, maxWeight: 2.0 },
            { name: "Large Box", length: 35, width: 30, height: 20, maxWeight: 10.0 },
            { name: "Extra Large Box", length: 45, width: 40, height: 30, maxWeight: 30.0 }
        ];

        const selectBox = (weight) => {
            for (const box of BOX_SIZES) {
                if (weight <= box.maxWeight) return box;
            }
            return BOX_SIZES[BOX_SIZES.length - 1]; // fallback XL
        };

        const box = selectBox(totalWeight);

        // Map our orderDetails to Shiprocket payload
        const envPrefix = process.env.NODE_ENV === "production" ? "" : "DEV-";
        const payload = {
            order_id: `${envPrefix}${orderDetails._id.toString()}`,
            order_date: new Date(orderDetails.createdAt).toISOString().split('T')[0],
            pickup_location: settings.pickupLocation,
            billing_customer_name: orderDetails.shippingAddress.name.split(' ')[0] || "Customer",
            billing_last_name: orderDetails.shippingAddress.name.split(' ').slice(1).join(' ') || "",
            billing_address: orderDetails.shippingAddress.street.trim().length >= 10
                ? orderDetails.shippingAddress.street.trim()
                : `${orderDetails.shippingAddress.street.trim()}, ${orderDetails.shippingAddress.city}`,
            billing_city: orderDetails.shippingAddress.city,
            billing_pincode: orderDetails.shippingAddress.pincode,
            billing_state: orderDetails.shippingAddress.state,
            billing_country: orderDetails.shippingAddress.country,
            billing_email: orderDetails.shippingAddress.email || "noemail@example.com",
            billing_phone: orderDetails.shippingAddress.phone,
            shipping_is_billing: true,
            order_items: orderItemsMapped,
            payment_method: orderDetails.paymentMethod === "Cash on Delivery" ? "COD" : "Prepaid",
            cod: orderDetails.paymentMethod === "Cash on Delivery" ? orderDetails.totalPrice : 0,
            shipping_charges: orderDetails.shippingPrice || 0,
            giftwrap_charges: 0,
            transaction_charges: orderDetails.codPrice || 0,
            total_discount: 0,
            sub_total: orderDetails.itemsPrice,
            length: box.length,
            breadth: box.width,
            height: box.height,
            weight: totalWeight
        };

        const fn = async () => {
            return await axios.post(`${SHIPROCKET_API_BASE}/orders/create/adhoc`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 8000
            });
        };

        const response = await executeWithRetry(fn);

        await logShiprocketAction(
            "/orders/create/adhoc", 
            "POST", 
            payload, 
            response.data, 
            response.status, 
            orderDetails._id
        );

        return response.data;
    } catch (error) {
        console.error("Error creating Shiprocket order:", error.response ? JSON.stringify(error.response.data) : error.message);
        await logShiprocketAction(
            "/orders/create/adhoc", 
            "POST", 
            { orderId: orderDetails._id }, 
            error.response?.data, 
            error.response?.status, 
            orderDetails._id,
            error.message
        );
        return null;
    }
};

const generateAWB = async (shipmentId, courierId = null) => {
    try {
        const token = await getShiprocketToken();
        const payload = { shipment_id: shipmentId };
        if (courierId) {
            payload.courier_id = courierId;
        }

        const fn = async () => {
            return await axios.post(`${SHIPROCKET_API_BASE}/courier/assign/awb`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 8000
            });
        };

        const response = await executeWithRetry(fn);
        await logShiprocketAction(
            "/courier/assign/awb",
            "POST",
            payload,
            response.data,
            response.status,
            null
        );

        return response.data;
    } catch (error) {
        console.error("Error generating AWB:", error.response ? error.response.data : error.message);
        await logShiprocketAction(
            "/courier/assign/awb",
            "POST",
            { shipmentId, courierId },
            error.response?.data,
            error.response?.status,
            null,
            error.message
        );
        return null;
    }
};

const schedulePickup = async (shipmentId) => {
    try {
        const token = await getShiprocketToken();
        const response = await axios.post(`${SHIPROCKET_API_BASE}/courier/generate/pickup`, {
            shipment_id: [shipmentId]
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            timeout: 8000
        });
        return response.data;
    } catch (error) {
        console.error("Error scheduling pickup:", error.response ? JSON.stringify(error.response.data) : error.message);
        return null;
    }
};

const processShiprocketFulfillment = async (order, courierId = null) => {
    try {
        console.log(`Pushing order ${order._id} to Shiprocket...`);
        // 1. Create Order in Shiprocket
        const srOrder = await createShiprocketOrder(order);
        
        console.log("SHIPROCKET API RAW RESPONSE:", JSON.stringify(srOrder));

        if (srOrder && srOrder.shipment_id) {
            return {
                shiprocketOrderId: srOrder.order_id,
                shipmentId: srOrder.shipment_id,
                trackingId: null,
                courierName: null,
                trackingUrl: null
            };
        }

        throw new Error("Shiprocket order creation failed. No shipment ID returned.");
    } catch (error) {
        console.error("Shiprocket fulfillment error:", error.message);
        throw error;
    }
};

const generateLabel = async (shipmentIds) => {
    try {
        const token = await getShiprocketToken();
        const response = await axios.post(`${SHIPROCKET_API_BASE}/courier/generate/label/pdf`, {
            shipment_id: shipmentIds
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error generating Label:", error.message);
        throw error;
    }
};

const createReverseShipment = async (order, reason) => {
    try {
        const token = await getShiprocketToken();
        const Settings = require("../models/Settings");
        const Product = require("../models/Product");

        // Load settings
        let settings = {
            pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || "Home",
            pickupPostcode: "500070",
            defaultWeight: 0.1,
            defaultLength: 10,
            defaultWidth: 10,
            defaultHeight: 10
        };
        const settingsDoc = await Settings.findOne({ key: "shippingSettings" });
        if (settingsDoc && settingsDoc.value) {
            settings = { ...settings, ...settingsDoc.value };
        }

        // Force correct pickup pincode (Hyderabad) regardless of DB value
        settings.pickupPostcode = process.env.SHIPROCKET_PICKUP_POSTCODE || "500070";

        // Calculate dynamic dimensions and weights
        let totalWeight = 0;
        let maxLength = 0;
        let maxWidth = 0;
        let totalHeight = 0;

        const orderItemsMapped = [];

        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            const qty = item.qty || 1;
            
            const shippingConfig = product?.shippingConfig || {};
            const itemWeight = (shippingConfig.weight || settings.defaultWeight) * qty;
            totalWeight += itemWeight;

            maxLength = Math.max(maxLength, shippingConfig.length || settings.defaultLength);
            maxWidth = Math.max(maxWidth, shippingConfig.width || settings.defaultWidth);
            totalHeight += (shippingConfig.height || settings.defaultHeight) * qty;

            orderItemsMapped.push({
                name: item.name,
                sku: item.product.toString(),
                units: qty,
                selling_price: item.price,
                discount: 0,
                tax: 0,
                hsn: shippingConfig.hsnCode || "711319"
            });
        }

        totalWeight = Math.max(0.1, totalWeight);
        maxLength = Math.max(10, maxLength);
        maxWidth = Math.max(10, maxWidth);
        totalHeight = Math.max(10, totalHeight);

        // Payload for reverse order
        const payload = {
            order_id: `${order._id.toString()}-R`,
            order_date: new Date().toISOString().split('T')[0],
            pickup_customer_name: order.shippingAddress.name.split(' ')[0] || "Customer",
            pickup_last_name: order.shippingAddress.name.split(' ').slice(1).join(' ') || "",
            pickup_address: order.shippingAddress.street,
            pickup_city: order.shippingAddress.city,
            pickup_state: order.shippingAddress.state,
            pickup_pincode: order.shippingAddress.pincode,
            pickup_country: order.shippingAddress.country || "India",
            pickup_phone: order.shippingAddress.phone,
            pickup_email: order.shippingAddress.email || "noemail@example.com",
            
            // Return destination is warehouse
            shipping_customer_name: "An.n.Ash Warehouse",
            shipping_address: "An.n.Ash Office, Main Market",
            shipping_city: "Delhi",
            shipping_state: "Delhi",
            shipping_country: "India",
            shipping_pincode: settings.pickupPostcode,
            shipping_phone: "9999999999",

            order_items: orderItemsMapped,
            payment_method: "Prepaid",
            sub_total: order.itemsPrice,
            length: maxLength,
            breadth: maxWidth,
            height: totalHeight,
            weight: totalWeight
        };

        const fn = async () => {
            return await axios.post(`${SHIPROCKET_API_BASE}/orders/create/return`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 8000
            });
        };

        const response = await executeWithRetry(fn);

        await logShiprocketAction(
            "/orders/create/return", 
            "POST", 
            payload, 
            response.data, 
            response.status, 
            order._id
        );

        return response.data;
    } catch (error) {
        console.error("Error creating reverse Shiprocket order:", error.response ? JSON.stringify(error.response.data) : error.message);
        await logShiprocketAction(
            "/orders/create/return", 
            "POST", 
            { orderId: order._id, reason }, 
            error.response?.data, 
            error.response?.status, 
            order._id,
            error.message
        );
        return null;
    }
};

const getTrackingDetails = async (awbCode) => {
    try {
        const token = await getShiprocketToken();
        const url = `${SHIPROCKET_API_BASE}/courier/track/awb/${awbCode}`;

        const fn = async () => {
            return await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 8000
            });
        };

        const response = await executeWithRetry(fn);
        await logShiprocketAction(
            `/courier/track/awb/${awbCode}`,
            "GET",
            null,
            response.data,
            response.status,
            null
        );

        return response.data;
    } catch (error) {
        console.error(`Error tracking AWB ${awbCode}:`, error.response ? JSON.stringify(error.response.data) : error.message);
        await logShiprocketAction(
            `/courier/track/awb/${awbCode}`,
            "GET",
            null,
            error.response?.data,
            error.response?.status,
            null,
            error.message
        );
        return null;
    }
};

const cancelShiprocketOrder = async (shiprocketOrderId) => {
    try {
        const token = await getShiprocketToken();
        const payload = { ids: [shiprocketOrderId] };

        const fn = async () => {
            return await axios.post(`${SHIPROCKET_API_BASE}/orders/cancel`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 8000
            });
        };

        const response = await executeWithRetry(fn);
        await logShiprocketAction(
            "/orders/cancel",
            "POST",
            payload,
            response.data,
            response.status,
            null
        );

        return response.data;
    } catch (error) {
        console.error("Error cancelling Shiprocket order:", error.response ? JSON.stringify(error.response.data) : error.message);
        await logShiprocketAction(
            "/orders/cancel",
            "POST",
            { shiprocketOrderId },
            error.response?.data,
            error.response?.status,
            null,
            error.message
        );
        return null;
    }
};

const generateManifest = async (shipmentIds) => {
    try {
        const token = await getShiprocketToken();
        const payload = { shipment_ids: shipmentIds };

        const fn = async () => {
            return await axios.post(`${SHIPROCKET_API_BASE}/manifests/generate`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 8000
            });
        };

        const response = await executeWithRetry(fn);
        await logShiprocketAction(
            "/manifests/generate",
            "POST",
            payload,
            response.data,
            response.status,
            null
        );
        return response.data;
    } catch (error) {
        console.error("Error generating Manifest:", error.message);
        return null;
    }
};

module.exports = {
    createShiprocketOrder,
    generateAWB,
    processShiprocketFulfillment,
    generateLabel,
    schedulePickup,
    calculateShippingRates,
    createReverseShipment,
    getTrackingDetails,
    cancelShiprocketOrder,
    generateManifest
};
