"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function OrderDetailsPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }

        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
            } catch (error) {
                console.log("Error fetching order");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrder();
    }, [id, user, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream"><p>Loading order...</p></div>;
    if (!order) return <div className="min-h-screen flex items-center justify-center bg-cream"><p>Order Not Found</p></div>;

    return (
        <div className="bg-cream min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <h1 className="text-3xl font-serif text-foreground">Order #{order._id.substring(0, 10)}</h1>
                    <Link href="/profile" className="text-gold hover:underline mt-4 md:mt-0 text-sm tracking-wide uppercase">
                        Back to Profile
                    </Link>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">

                    {/* Order Items & Info */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Status Card */}
                        <div className="bg-white p-6 border border-beige rounded-xl shadow-sm">
                            <h2 className="text-xl font-serif mb-4 flex justify-between items-center">
                                Order Tracking
                                <span className="text-sm font-sans font-normal uppercase tracking-widest text-gold bg-beige px-3 py-1 rounded-full">{order.orderStatus}</span>
                            </h2>
                            {/* Simplified timeline */}
                            <div className="mt-8 flex justify-between relative before:absolute before:border-t-2 before:border-beige before:w-full before:top-4 before:z-0">
                                {["order placed", "shipped", "delivered"].map((step, idx) => {
                                    const isActive = order.orderStatus === step || order.isDelivered; // Simplified map
                                    return (
                                        <div key={idx} className="relative z-10 flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-gold text-white' : 'bg-gray-200 text-gray-400'}`}>
                                                {idx + 1}
                                            </div>
                                            <span className={`text-xs mt-2 uppercase tracking-wider ${isActive ? 'text-foreground font-semibold' : 'text-gray-400'}`}>{step}</span>
                                        </div>
                                    )
                                })}
                            </div>

                            {order.trackingId && (
                                <div className="mt-6 pt-6 border-t border-beige">
                                    <p className="text-sm text-foreground"><strong>Tracking ID:</strong> {order.trackingId}</p>
                                </div>
                            )}
                        </div>

                        {/* Items */}
                        <div className="bg-white p-6 border border-beige rounded-xl shadow-sm">
                            <h2 className="text-xl font-serif mb-4">Order Items</h2>
                            <ul className="divide-y divide-beige">
                                {order.orderItems.map((item: any) => (
                                    <li key={item.product} className="py-4 flex">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-white border border-beige rounded-md overflow-hidden">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="ml-4 flex-1 flex flex-col justify-center">
                                            <Link href={`/product/${item.product}`} className="font-serif text-lg hover:text-gold transition">
                                                {item.name}
                                            </Link>
                                            <p className="text-foreground text-sm mt-1">{item.qty} x ₹{item.price} = ₹{item.qty * item.price}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Order Summary & Shipping Details */}
                    <div className="mt-8 lg:mt-0 lg:col-span-4 space-y-8">

                        <div className="bg-white p-6 border border-beige rounded-xl shadow-sm">
                            <h2 className="text-xl font-serif mb-4">Summary</h2>
                            <dl className="space-y-4 text-sm text-foreground">
                                <div className="flex justify-between">
                                    <dt>Items</dt>
                                    <dd>₹{order.itemsPrice}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt>Shipping</dt>
                                    <dd>₹{order.shippingPrice}</dd>
                                </div>
                                <div className="flex justify-between border-t border-beige pt-4 font-semibold text-base">
                                    <dt>Total</dt>
                                    <dd>₹{order.totalPrice}</dd>
                                </div>
                            </dl>
                            {!order.isPaid && order.paymentMethod === "Razorpay" && (
                                <div className="mt-6">
                                    <Button fullWidth onClick={() => alert("Razorpay mock flow. Payment successful")}>
                                        Pay Now
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-6 border border-beige rounded-xl shadow-sm">
                            <h2 className="text-xl font-serif mb-4">Shipping Info</h2>
                            <div className="text-sm text-foreground space-y-1">
                                <p className="font-medium">{order.shippingAddress.name}</p>
                                <p>{order.shippingAddress.email} | {order.shippingAddress.phone}</p>
                                <p>{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                                <p>{order.shippingAddress.country}</p>
                            </div>

                            <div className="mt-6 pt-6 border-t border-beige">
                                <h3 className="font-semibold text-sm mb-2">Payment Method</h3>
                                <p className="text-sm">{order.paymentMethod}</p>
                                <p className={`text-sm mt-1 font-semibold ${order.isPaid ? 'text-green-600' : 'text-red-500'}`}>
                                    {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : "Not Paid"}
                                </p>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
