const axios = require('axios');

const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in/v1/external';

let shiprocketToken = null;
let tokenExpiry = null;

const getShiprocketToken = async () => {
    try {
        if (shiprocketToken && tokenExpiry && Date.now() < tokenExpiry) {
            return shiprocketToken;
        }

        const response = await axios.post(`${SHIPROCKET_API_BASE}/auth/login`, {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD,
        }, { timeout: 5000 });

        shiprocketToken = response.data.token;
        // Token roughly expires in 10 days; we set it to 9 days to be safe
        tokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000);
        return shiprocketToken;
    } catch (error) {
        console.error("Error authenticating with Shiprocket (Timeout or Auth Failure)", error.message);
        throw new Error("Shiprocket Authentication failed");
    }
};

const createShiprocketOrder = async (orderDetails) => {
    try {
        const token = await getShiprocketToken();

        // Map our orderDetails to Shiprocket payload
        const payload = {
            order_id: orderDetails._id.toString(),
            order_date: new Date(orderDetails.createdAt).toISOString().split('T')[0],
            pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
            billing_customer_name: orderDetails.shippingAddress.name.split(' ')[0] || "Customer",
            billing_last_name: orderDetails.shippingAddress.name.split(' ').slice(1).join(' ') || "",
            billing_address: orderDetails.shippingAddress.street,
            billing_city: orderDetails.shippingAddress.city,
            billing_pincode: orderDetails.shippingAddress.pincode,
            billing_state: orderDetails.shippingAddress.state,
            billing_country: orderDetails.shippingAddress.country,
            billing_email: orderDetails.shippingAddress.email || "noemail@example.com",
            billing_phone: orderDetails.shippingAddress.phone,
            shipping_is_billing: true,
            order_items: orderDetails.orderItems.map(item => ({
                name: item.name,
                sku: item.product.toString(),
                units: item.qty,
                selling_price: item.price,
                discount: 0,
                tax: 0,
                hsn: 711319 // Example HSN code for jewelry
            })),
            payment_method: orderDetails.paymentMethod === "Cash on Delivery" ? "COD" : "Prepaid",
            shipping_charges: orderDetails.shippingPrice,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: orderDetails.totalPrice,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5
        };

        const response = await axios.post(`${SHIPROCKET_API_BASE}/orders/create/adhoc`, payload, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            timeout: 5000
        });

        return response.data;
    } catch (error) {
        console.error("Error creating Shiprocket order:", error.response ? JSON.stringify(error.response.data) : error.message);
        // Returning null instead of throwing to prevent failing the entire user checkout flow if shiprocket is down
        return null;
    }
};

const generateAWB = async (shipmentId) => {
    try {
        const token = await getShiprocketToken();
        const response = await axios.post(`${SHIPROCKET_API_BASE}/courier/assign/awb`, {
            shipment_id: shipmentId
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error generating AWB:", error.response ? error.response.data : error.message);
        return null;
    }
};

const processShiprocketFulfillment = async (order) => {
    try {
        console.log(`Processing Shiprocket fulfillment for order ${order._id}`);
        // 1. Create Order in Shiprocket
        const srOrder = await createShiprocketOrder(order);

        if (srOrder && srOrder.shipment_id) {
            // 2. Assign AWB (Auto-generate shipping label tracking)
            const awbRes = await generateAWB(srOrder.shipment_id);

            let trackingId = null;
            if (awbRes && awbRes.response && awbRes.response.data && awbRes.response.data.awb_code) {
                trackingId = awbRes.response.data.awb_code;
            }

            return {
                shiprocketOrderId: srOrder.order_id,
                shipmentId: srOrder.shipment_id,
                trackingId: trackingId
            };
        }

        throw new Error("Shiprocket fulfillment failed. No shipment ID returned.");
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

module.exports = {
    createShiprocketOrder,
    generateAWB,
    processShiprocketFulfillment,
    generateLabel
};
