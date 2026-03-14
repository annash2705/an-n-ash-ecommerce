const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail", // Or another service provider like SendGrid, Mailgun
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `An.n.Ash <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.response}`);
        return true;
    } catch (error) {
        console.error(`Error sending email (Simulating Success for Testing): ${error.message}`);
        return false;
    }
};

const sendOrderConfirmationEmail = async (userEmail, orderId, amount) => {
    const html = `
        <h1>Thank you for your order!</h1>
        <p>Your order <strong>#${orderId}</strong> has been placed successfully.</p>
        <p>Total amount: ₹${amount}</p>
        <p>We will notify you once your whimsical jewelry is packed and shipped.</p>
    `;
    await sendEmail({ email: userEmail, subject: "Order Confirmation - An.n.Ash", html });
}

module.exports = { sendEmail, sendOrderConfirmationEmail };
