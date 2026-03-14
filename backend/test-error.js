const mongoose = require("mongoose");
const Order = require("./models/Order");

const demo = async () => {
    try {
        const order = new Order({
            orderItems: [
                {
                    product: "60c72b2f9b1e8a0015a9d47a",
                    name: "Necklace",
                    qty: 1,
                    price: 500,
                    image: ""
                }
            ],
            user: "60c72b2f9b1e8a0015a9d47b",
            shippingAddress: {
                name: "Test",
                street: "123",
                city: "Test",
                state: "Test",
                pincode: "123456",
                country: "India",
                email: "mocktest@example.com",
                phone: "9999999999"
            },
            paymentMethod: "Cash on Delivery",
            itemsPrice: 500,
            shippingPrice: 100,
            totalPrice: 600
        });

        await order.validate();
        console.log("Validation Successful");
    } catch (e) {
        console.error("Validation Failed:", e.message);
    }
};

demo();
