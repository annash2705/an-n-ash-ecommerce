"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";
import Script from "next/script";

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { cartItems, cartTotal, clearCart } = useCart();

    const [address, setAddress] = useState({
        name: "", phone: "", email: "", street: "", city: "", state: "", pincode: "", country: "India"
    });

    const [paymentMethod, setPaymentMethod] = useState("Razorpay");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!user) {
            router.push("/login?redirect=checkout");
        }
    }, [user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
        // Clear error for this field when user types
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!address.name.trim()) newErrors.name = "Full name is required";
        if (!address.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
            newErrors.phone = "Enter a valid 10-digit Indian phone number";
        }
        if (!address.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) {
            newErrors.email = "Enter a valid email address";
        }
        if (!address.street.trim()) newErrors.street = "Street address is required";
        if (!address.city.trim()) newErrors.city = "City is required";
        if (!address.state.trim()) newErrors.state = "State is required";
        if (!address.pincode.trim()) {
            newErrors.pincode = "Pincode is required";
        } else if (!/^\d{6}$/.test(address.pincode.trim())) {
            newErrors.pincode = "Enter a valid 6-digit pincode";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const placeOrderHandler = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const orderData = {
                orderItems: cartItems,
                shippingAddress: address,
                paymentMethod: paymentMethod,
                itemsPrice: cartTotal,
                shippingPrice: cartTotal > 0 ? 100 : 0,
                totalPrice: cartTotal + (cartTotal > 0 ? 100 : 0)
            };

            const { data } = await api.post("/orders", orderData);

            if (paymentMethod === "Razorpay") {
                const { data: clientId } = await api.get("/config/razorpay");

                if (!clientId || clientId.includes("your_razorpay")) {
                    alert("Razorpay integration is incomplete. Please setup RAZORPAY_KEY_ID in your environment.");
                    setLoading(false);
                    return;
                }

                const { data: rzpOrder } = await api.post(`/orders/${data._id}/pay`);

                const options = {
                    key: clientId,
                    amount: rzpOrder.amount,
                    currency: rzpOrder.currency,
                    name: "An.n.Ash",
                    description: "Order Payment",
                    order_id: rzpOrder.id,
                    handler: async function (response: any) {
                        try {
                            await api.post(`/orders/${data._id}/verify`, response);
                            clearCart();
                            router.push(`/order/${data._id}`);
                        } catch (err) {
                            alert("Payment verification failed.");
                        }
                    },
                    prefill: {
                        name: address.name,
                        email: address.email,
                        contact: address.phone
                    },
                    theme: {
                        color: "#D4AF37"
                    }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.on("payment.failed", function (response: any) {
                    alert("Payment Failed: " + response.error.description);
                });
                rzp.open();
            } else {
                // Cash on Delivery
                clearCart();
                router.push(`/order/${data._id}`);
            }

        } catch (error: any) {
            alert(error.response?.data?.message || "Error placing order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const inputClass = (field: string) =>
        `w-full border ${errors[field] ? 'border-red-400' : 'border-beige'} rounded-sm p-2 text-sm focus:outline-none ${errors[field] ? 'focus:border-red-400' : 'focus:border-gold'}`;

    return (
        <div className="bg-cream min-h-screen py-16">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif text-foreground mb-10 text-center">Checkout</h1>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                    <div className="lg:col-span-8 space-y-8">

                        {/* Shipping Address */}
                        <div className="bg-white p-6 border border-beige rounded-xl shadow-sm">
                            <h2 className="text-2xl font-serif mb-4">Shipping Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 text-foreground">Full Name *</label>
                                    <input type="text" name="name" onChange={handleChange} className={inputClass("name")} />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 text-foreground">Phone Number *</label>
                                    <input type="text" name="phone" onChange={handleChange} placeholder="10-digit number" className={inputClass("phone")} />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm mb-1 text-foreground">Email *</label>
                                    <input type="email" name="email" onChange={handleChange} className={inputClass("email")} />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm mb-1 text-foreground">Street Address *</label>
                                    <input type="text" name="street" onChange={handleChange} className={inputClass("street")} />
                                    {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 text-foreground">City *</label>
                                    <input type="text" name="city" onChange={handleChange} className={inputClass("city")} />
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 text-foreground">State *</label>
                                    <input type="text" name="state" onChange={handleChange} className={inputClass("state")} />
                                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 text-foreground">Pincode *</label>
                                    <input type="text" name="pincode" onChange={handleChange} placeholder="6-digit pincode" className={inputClass("pincode")} />
                                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 text-foreground">Country</label>
                                    <input type="text" name="country" value="India" readOnly className="w-full border border-beige rounded-sm p-2 text-sm bg-gray-50" />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-6 border border-beige rounded-xl shadow-sm">
                            <h2 className="text-2xl font-serif mb-4">Payment Method</h2>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="razorpay"
                                        name="paymentMethod"
                                        value="Razorpay"
                                        checked={paymentMethod === "Razorpay"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="text-gold focus:ring-gold"
                                    />
                                    <label htmlFor="razorpay" className="ml-3 text-foreground">Razorpay (Cards, UPI, NetBanking)</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="cod"
                                        name="paymentMethod"
                                        value="Cash on Delivery"
                                        checked={paymentMethod === "Cash on Delivery"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="text-gold focus:ring-gold"
                                    />
                                    <label htmlFor="cod" className="ml-3 text-foreground">Cash on Delivery</label>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Order Summary */}
                    <div className="mt-8 lg:mt-0 lg:col-span-4 self-start sticky top-28 bg-white p-6 border border-beige rounded-xl shadow-sm">
                        <h2 className="text-2xl font-serif mb-6">Review Order</h2>

                        <ul className="divide-y divide-beige border-b border-beige mb-6">
                            {cartItems.map((item) => (
                                <li key={item.product} className="py-2 flex items-center justify-between text-sm">
                                    <span className="text-foreground truncate pr-4">{item.qty} x {item.name}</span>
                                    <span className="font-medium">₹{item.price * item.qty}</span>
                                </li>
                            ))}
                        </ul>

                        <dl className="space-y-4 text-sm text-foreground">
                            <div className="flex items-center justify-between">
                                <dt>Subtotal</dt>
                                <dd className="font-medium">₹{cartTotal}</dd>
                            </div>
                            <div className="flex items-center justify-between border-t border-beige pt-4">
                                <dt>Shipping estimate</dt>
                                <dd className="font-medium">₹{cartTotal > 0 ? 100 : 0}</dd>
                            </div>
                            <div className="flex items-center justify-between border-t border-beige pt-4 text-lg font-medium">
                                <dt>Order total</dt>
                                <dd>₹{cartTotal > 0 ? cartTotal + 100 : 0}</dd>
                            </div>
                        </dl>

                        <div className="mt-8">
                            <Button
                                fullWidth
                                size="lg"
                                onClick={placeOrderHandler}
                                disabled={cartItems.length === 0 || loading}
                            >
                                {loading ? "Processing..." : "Place Order"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
