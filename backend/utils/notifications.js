const { sendEmail } = require("./sendEmail");
const Settings = require("../models/Settings");

// Mock SMS Driver (Simulates gateway like MSG91/Twilio)
const sendSMS = async (phone, message) => {
    try {
        console.log(`[SMS NOTIFICATION SENT TO ${phone}]: ${message}`);
        return true;
    } catch (err) {
        console.error("Failed to send SMS:", err.message);
        return false;
    }
};

// Mock WhatsApp Driver (Simulates official WhatsApp Business Cloud API)
const sendWhatsApp = async (phone, templateName, variables) => {
    try {
        console.log(`[WHATSAPP NOTIFICATION SENT TO ${phone}] Template: ${templateName}, Variables: ${JSON.stringify(variables)}`);
        return true;
    } catch (err) {
        console.error("Failed to send WhatsApp:", err.message);
        return false;
    }
};

// Elegant responsive HTML Email Template Wrapper
const getEmailTemplate = (title, statusHeader, bodyContent, order, trackingButton = "") => {
    const itemsRows = order.orderItems.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #EAE6DF; font-size: 14px; color: #4A4A4A;">${item.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #EAE6DF; font-size: 14px; color: #4A4A4A; text-align: center;">${item.qty}</td>
            <td style="padding: 12px; border-bottom: 1px solid #EAE6DF; font-size: 14px; color: #4A4A4A; text-align: right;">₹${item.price * item.qty}</td>
        </tr>
    `).join("");

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
    </head>
    <body style="font-family: 'Georgia', 'Times New Roman', Times, serif; background-color: #FAF8F5; margin: 0; padding: 20px; -webkit-font-smoothing: antialiased;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #EAE6DF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <!-- Header -->
            <tr>
                <td style="background-color: #FAF8F5; padding: 30px; text-align: center; border-bottom: 1px solid #EAE6DF;">
                    <div style="font-size: 26px; letter-spacing: 0.15em; text-transform: uppercase; color: #1C1C1C; font-weight: 300;">An.n.Ash</div>
                    <div style="font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #C49A3C; margin-top: 5px;">Whimsical Jewelry</div>
                </td>
            </tr>
            <!-- Status Alert Banner -->
            <tr>
                <td style="background-color: #C49A3C; padding: 15px 30px; text-align: center; color: #FFFFFF; font-size: 16px; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase;">
                    ${statusHeader}
                </td>
            </tr>
            <!-- Content -->
            <tr>
                <td style="padding: 40px 30px; line-height: 1.6; color: #333333; font-size: 16px; font-family: sans-serif;">
                    ${bodyContent}
                    
                    ${trackingButton ? `<div style="text-align: center; margin: 30px 0;">${trackingButton}</div>` : ""}

                    <!-- Order Details Box -->
                    <div style="background-color: #FAF8F5; border: 1px solid #EAE6DF; border-radius: 8px; padding: 20px; margin-top: 30px;">
                        <h3 style="margin-top: 0; font-family: 'Georgia', serif; color: #1C1C1C; font-size: 18px; border-bottom: 1px solid #EAE6DF; padding-bottom: 8px;">Order Details</h3>
                        <p style="margin: 5px 0; font-size: 13px; color: #666666;"><strong>Order ID:</strong> #${order._id.toString()}</p>
                        <p style="margin: 5px 0; font-size: 13px; color: #666666;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                        <p style="margin: 5px 0; font-size: 13px; color: #666666;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>

                        <!-- Items Table -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #EAE6DF;">
                                    <th style="padding: 8px 12px; font-size: 12px; text-align: left; text-transform: uppercase; color: #555555;">Item</th>
                                    <th style="padding: 8px 12px; font-size: 12px; text-align: center; text-transform: uppercase; color: #555555;">Qty</th>
                                    <th style="padding: 8px 12px; font-size: 12px; text-align: right; text-transform: uppercase; color: #555555;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsRows}
                                <tr>
                                    <td colspan="2" style="padding: 10px 12px 5px 12px; font-size: 14px; text-align: right; color: #666666;">Subtotal:</td>
                                    <td style="padding: 10px 12px 5px 12px; font-size: 14px; text-align: right; color: #1C1C1C; font-weight: bold;">₹${order.itemsPrice}</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="padding: 5px 12px 5px 12px; font-size: 14px; text-align: right; color: #666666;">Shipping:</td>
                                    <td style="padding: 5px 12px 5px 12px; font-size: 14px; text-align: right; color: #1C1C1C; font-weight: bold;">₹${order.shippingPrice}</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="padding: 5px 12px 10px 12px; font-size: 16px; text-align: right; color: #1C1C1C; font-weight: bold; border-top: 1px solid #EAE6DF;">Total Paid:</td>
                                    <td style="padding: 5px 12px 10px 12px; font-size: 18px; text-align: right; color: #C49A3C; font-weight: bold; border-top: 1px solid #EAE6DF;">₹${order.totalPrice}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Shipping Address Box -->
                    <div style="margin-top: 25px; font-size: 14px;">
                        <h4 style="margin: 0 0 5px 0; font-family: 'Georgia', serif; color: #1C1C1C;">Delivery Address:</h4>
                        <p style="margin: 0; color: #555555; font-style: italic;">
                            ${order.shippingAddress.name}<br>
                            ${order.shippingAddress.street}, ${order.shippingAddress.city}<br>
                            ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
                            Phone: ${order.shippingAddress.phone}
                        </p>
                    </div>
                </td>
            </tr>
            <!-- Footer -->
            <tr>
                <td style="background-color: #FAF8F5; padding: 20px; text-align: center; border-top: 1px solid #EAE6DF; font-size: 12px; color: #999999; font-family: sans-serif;">
                    © ${new Date().getFullYear()} An.n.Ash Jewelry. All rights reserved.<br>
                    Need help? Contact us at <a href="mailto:support@annash.com" style="color: #C49A3C; text-decoration: none;">support@annash.com</a>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

// Event-driven Orchestrator
const sendShippingNotification = async (order, eventType) => {
    try {
        // Load Settings
        let notificationsConfig = {
            smsEnabled: false,
            whatsappEnabled: false
        };
        const settingsDoc = await Settings.findOne({ key: "shippingSettings" });
        if (settingsDoc && settingsDoc.value) {
            notificationsConfig.smsEnabled = !!settingsDoc.value.smsNotificationsEnabled;
            notificationsConfig.whatsappEnabled = !!settingsDoc.value.whatsappNotificationsEnabled;
        }

        const phone = order.shippingAddress.phone;
        const email = order.shippingAddress.email;
        const trackingUrl = order.trackingId ? `https://shiprocket.co/tracking/${order.trackingId}` : "";
        const orderIdShort = order._id.toString().substring(0, 8);

        let emailSubject = "";
        let statusHeader = "";
        let emailBody = "";
        let smsText = "";
        let trackingButton = "";

        if (order.trackingId) {
            trackingButton = `
                <a href="${trackingUrl}" target="_blank" style="background-color: #C49A3C; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; letter-spacing: 0.05em; display: inline-block; box-shadow: 0 4px 6px rgba(196,154,60,0.2);">
                    TRACK PACKAGE
                </a>
            `;
        }

        switch (eventType) {
            case "order_placed":
                emailSubject = "Your Whimsical Jewelry Order has been Placed! ✦";
                statusHeader = "Order Confirmed";
                emailBody = `<p>Dear <strong>${order.shippingAddress.name}</strong>,</p>
                             <p>Thank you for choosing <strong>An.n.Ash</strong>. We are thrilled to confirm that your order <strong>#${order._id}</strong> has been successfully placed!</p>
                             <p>Our artisans are already preparing your handmade jewelry with the utmost care. We will email you again as soon as your shipment is packed and dispatched.</p>`;
                smsText = `Your order #${orderIdShort} has been confirmed. We're packing your whimsical jewelry! - An.n.Ash`;
                break;

            case "shipment_created":
                emailSubject = "Your An.n.Ash Shipment is Ready to Ship! 🚀";
                statusHeader = "Shipment Created";
                emailBody = `<p>Great news! Your package is packed and ready to go. We have generated the shipment label and scheduled courier pickup.</p>
                             <p><strong>Courier:</strong> ${order.courierName || "Shiprocket Partner"}<br>
                             <strong>AWB Number:</strong> ${order.trackingId}</p>
                             <p>Click the track button below to follow your package's journey.</p>`;
                smsText = `Good news! Your order #${orderIdShort} has been packed. AWB: ${order.trackingId}. Track here: ${trackingUrl}`;
                break;

            case "pickup_completed":
                emailSubject = "Your Package has been Picked Up! 📦";
                statusHeader = "Picked Up";
                emailBody = `<p>Your package has been successfully picked up by our courier partner and is officially on its way to you.</p>`;
                smsText = `Your order #${orderIdShort} has been picked up by our courier and is on its way. Track: ${trackingUrl}`;
                break;

            case "in_transit":
                emailSubject = "Your An.n.Ash Package is In Transit 🚚";
                statusHeader = "In Transit";
                emailBody = `<p>Your package is moving towards its destination city. It is currently in transit.</p>`;
                smsText = `Your order #${orderIdShort} is in transit. Expected delivery soon! Track here: ${trackingUrl}`;
                break;

            case "out_for_delivery":
                emailSubject = "Your Package is Out for Delivery Today! 🌟";
                statusHeader = "Out For Delivery";
                emailBody = `<p>Hooray! Your whimsical jewelry package is out for delivery in your area today. Please keep your phone handy so the delivery executive can contact you.</p>`;
                smsText = `Your order #${orderIdShort} is out for delivery today. Get ready to receive your whimsy! Track: ${trackingUrl}`;
                break;

            case "delivered":
                emailSubject = "Your Whimsical Package has been Delivered! 🎉";
                statusHeader = "Delivered";
                emailBody = `<p>Wonderful news! Our courier partner reports that your package has been successfully delivered.</p>
                             <p>We hope your new jewelry brings a touch of whimsy and joy to your life. We would love to hear your feedback!</p>`;
                smsText = `Delivered! Your order #${orderIdShort} has been successfully delivered. Enjoy your whimsical jewelry!`;
                break;

            case "cancelled":
                emailSubject = "Order Cancellation Notice - An.n.Ash";
                statusHeader = "Cancelled";
                emailBody = `<p>We are writing to confirm that your order <strong>#${order._id}</strong> has been cancelled.</p>
                             <p>If this was a paid order, a refund has been initiated to your original payment method and will reflect within 5-7 business days.</p>`;
                smsText = `Your order #${orderIdShort} has been cancelled. If paid, your refund is processing. - An.n.Ash`;
                break;

            case "return_requested":
                emailSubject = "Return Request Received - An.n.Ash";
                statusHeader = "Return Requested";
                emailBody = `<p>We have received your return request for order <strong>#${order._id}</strong>.</p>
                             <p><strong>Reason:</strong> ${order.returnDetails.reason}</p>
                             <p>Our review team will process this request within 24-48 hours. If approved, a reverse pickup will be scheduled automatically.</p>`;
                smsText = `We received your return request for order #${orderIdShort}. We are reviewing it now.`;
                break;

            case "return_approved":
                emailSubject = "Your Return Request has been Approved! ✦";
                statusHeader = "Return Approved";
                emailBody = `<p>Good news! Your return request for order <strong>#${order._id}</strong> has been approved.</p>
                             <p>We have automatically created the reverse shipping shipment. A courier partner will contact you soon for the pickup.</p>
                             <p><strong>Reverse AWB:</strong> ${order.returnDetails.reverseAwbCode || "Pending Assignment"}</p>`;
                smsText = `Your return request for order #${orderIdShort} was approved. Reverse AWB: ${order.returnDetails.reverseAwbCode || "Pending"}.`;
                break;

            case "return_rejected":
                emailSubject = "Return Request Update - An.n.Ash";
                statusHeader = "Return Rejected";
                emailBody = `<p>We are writing to inform you that your return request for order <strong>#${order._id}</strong> was not approved after review.</p>
                             <p>If you believe this is an error or have additional details to provide, please contact our support team.</p>`;
                smsText = `Your return request for order #${orderIdShort} has been reviewed and declined. Contact support for help.`;
                break;

            case "returned":
                emailSubject = "Return Completed & Refund Processed 🎉";
                statusHeader = "Returned";
                emailBody = `<p>We have successfully received the returned items at our warehouse and processed your return.</p>
                             <p><strong>Refund Status:</strong> Refunded<br>
                             <strong>Refund Amount:</strong> ₹${order.returnDetails.refundAmount || order.totalPrice}</p>
                             <p>The refund should reflect in your account shortly.</p>`;
                smsText = `Return completed for order #${orderIdShort}. Your refund of ₹${order.returnDetails.refundAmount} has been processed!`;
                break;

            default:
                return;
        }

        // 1. Send Email (Always)
        const html = getEmailTemplate(emailSubject, statusHeader, emailBody, order, trackingButton);
        await sendEmail({ email, subject: emailSubject, html }).catch(e => {
            console.error("Failed to send notification email:", e.message);
        });

        // 2. Send SMS (If enabled)
        if (notificationsConfig.smsEnabled) {
            await sendSMS(phone, smsText);
        }

        // 3. Send WhatsApp (If enabled)
        if (notificationsConfig.whatsappEnabled) {
            const waVariables = [
                orderIdShort,
                statusHeader,
                trackingUrl || "N/A"
            ];
            await sendWhatsApp(phone, "shipping_status_update", waVariables);
        }

    } catch (err) {
        console.error("Notification orchestrator failed:", err.message);
    }
};

module.exports = {
    sendSMS,
    sendWhatsApp,
    sendShippingNotification
};
