"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import api from "@/lib/axios";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import Script from "next/script";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

export default function OrderDetailsPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const router = useRouter();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [payLoading, setPayLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    
    // Return states
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState("");
    const [submittingReturn, setSubmittingReturn] = useState(false);

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

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }
        if (id) fetchOrder();
    }, [id, user, router]);

    const handlePayNow = async () => {
        setPayLoading(true);
        try {
            const { data: clientId } = await api.get("/config/razorpay");
            const { data: rzpOrder } = await api.post(`/orders/${order._id}/pay`);

            const options = {
                key: clientId,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: "An.n.Ash",
                description: "Order Payment",
                order_id: rzpOrder.id,
                handler: async function (response: any) {
                    try {
                        await api.post(`/orders/${order._id}/verify`, response);
                        fetchOrder();
                    } catch (err) {
                        alert("Payment verification failed.");
                    }
                },
                prefill: {
                    name: order.shippingAddress.name,
                    email: order.shippingAddress.email,
                    contact: order.shippingAddress.phone
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
        } catch (err) {
            alert("Failed to initiate payment. Please try again.");
        } finally {
            setPayLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        setCancelLoading(true);
        try {
            await api.put(`/orders/${order._id}/cancel`);
            fetchOrder();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to cancel order.");
        } finally {
            setCancelLoading(false);
        }
    };

    const handleReturnRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!returnReason.trim()) {
            alert("Please enter a return reason.");
            return;
        }
        setSubmittingReturn(true);
        try {
            await api.put(`/orders/${order._id}/return-request`, { reason: returnReason });
            alert("Return request submitted successfully!");
            setShowReturnModal(false);
            fetchOrder();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to submit return request.");
        } finally {
            setSubmittingReturn(false);
        }
    };

    const handleReorder = async () => {
        try {
            for (const item of order.orderItems) {
                await addToCart({
                    product: item.product,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    countInStock: item.countInStock || 10,
                    qty: item.qty
                });
            }
            router.push("/cart");
        } catch (err) {
            alert("Failed to add items to cart.");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-cream">
            <div className="animate-pulse text-gold text-lg">Loading order...</div>
        </div>
    );
    if (!order) return (
        <div className="min-h-screen flex items-center justify-center bg-cream">
            <div className="text-center">
                <p className="text-red-500 text-lg mb-4">Order Not Found</p>
                <Button variant="outline" onClick={() => router.push("/profile")}>Back to Profile</Button>
            </div>
        </div>
    );

    const isCancelled = order.orderStatus === "cancelled";

    return (
        <div className="bg-cream min-h-screen py-16 text-foreground">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-serif">Order #{order._id.substring(0, 10)}</h1>
                        <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-4 items-center mt-4 md:mt-0">
                        <Button variant="outline" size="sm" onClick={handleReorder}>Reorder All Items</Button>
                        <Link href="/profile" className="text-gold hover:underline text-sm tracking-wide uppercase">
                            Back to Profile
                        </Link>
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                    {/* Left Column: Timeline & Items */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Interactive Timeline */}
                        <div className="bg-white p-6 sm:p-8 border border-beige rounded-xl shadow-sm">
                            <h2 className="text-xl font-serif mb-6 flex justify-between items-center border-b border-beige pb-4">
                                Shipment Timeline
                                <span className={`text-xs font-sans uppercase tracking-widest px-3 py-1 rounded-full ${isCancelled ? 'text-red-600 bg-red-50' : 'text-gold bg-gold/10 border border-gold/20'}`}>
                                    {order.orderStatus}
                                </span>
                            </h2>

                            {isCancelled ? (
                                <div className="text-center py-4 text-red-500 font-medium bg-red-50 border border-red-200 rounded-xl">
                                    This order has been cancelled.
                                </div>
                            ) : (
                                <div className="relative pl-6 border-l-2 border-beige space-y-8 ml-3">
                                    {order.orderTimeline && order.orderTimeline.length > 0 ? (
                                        order.orderTimeline.map((step: any, idx: number) => (
                                            <div key={idx} className="relative">
                                                {/* Timeline Node dot */}
                                                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-gold bg-white flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold uppercase tracking-wider text-gold-dark">{step.status}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{new Date(step.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                                                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="relative">
                                            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-gold bg-gold"></div>
                                            <div>
                                                <p className="text-sm font-semibold uppercase tracking-wider text-gold-dark">Order Placed</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                                                <p className="text-sm text-gray-600 mt-1">We have received your order.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tracking Block */}
                            {order.trackingId && (
                                <div className="mt-8 pt-6 border-t border-beige flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-cream/20 p-4 rounded-xl">
                                    <div>
                                        <p className="text-sm text-gray-500">AWB / Tracking Number</p>
                                        <p className="font-semibold text-lg text-foreground font-mono">{order.trackingId}</p>
                                        {order.courierName && <p className="text-xs text-gray-400 mt-0.5">Courier Partner: {order.courierName}</p>}
                                    </div>
                                    <Button
                                        onClick={() => window.open(order.trackingUrl || `https://shiprocket.co/tracking/${order.trackingId}`, "_blank")}
                                    >
                                        Track Package
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Return details card */}
                        {order.returnDetails?.isRequested && (
                            <div className="bg-white p-6 sm:p-8 border border-beige rounded-xl shadow-sm">
                                <h2 className="text-xl font-serif mb-4 text-foreground">Return Request Details</h2>
                                <div className="space-y-3 text-sm text-gray-600">
                                    <p><strong>Reason:</strong> "{order.returnDetails.reason}"</p>
                                    <p><strong>Return Status:</strong> 
                                        <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold/10 text-gold-dark border border-gold/20">
                                            {order.returnDetails.status}
                                        </span>
                                    </p>
                                    {order.returnDetails.reverseAwbCode && (
                                        <p><strong>Reverse Courier Tracking ID (AWB):</strong> <span className="font-mono font-semibold text-foreground">{order.returnDetails.reverseAwbCode}</span></p>
                                    )}
                                    <p><strong>Refund Status:</strong> {order.returnDetails.refundStatus}</p>
                                    {order.returnDetails.refundAmount > 0 && <p><strong>Refund Amount:</strong> ₹{order.returnDetails.refundAmount}</p>}
                                </div>
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="bg-white p-6 sm:p-8 border border-beige rounded-xl shadow-sm">
                            <h2 className="text-xl font-serif mb-4">Order Items</h2>
                            <ul className="divide-y divide-beige">
                                {order.orderItems.map((item: any) => (
                                    <li key={item.product} className="py-4 flex">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-white border border-beige rounded-md overflow-hidden">
                                            <img src={getOptimizedImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
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

                    {/* Right Column: Summary & Info */}
                    <div className="mt-8 lg:mt-0 lg:col-span-4 space-y-8">
                        <div className="bg-white p-6 border border-beige rounded-xl shadow-sm">
                            <h2 className="text-xl font-serif mb-4">Summary</h2>
                            <dl className="space-y-4 text-sm text-foreground">
                                <div className="flex justify-between">
                                    <dt>Items Subtotal</dt>
                                    <dd>₹{order.itemsPrice}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt>Shipping Price</dt>
                                    <dd>{order.shippingPrice > 0 ? `₹${order.shippingPrice}` : "Free"}</dd>
                                </div>
                                {order.codPrice > 0 && (
                                    <div className="flex justify-between">
                                        <dt>COD Surcharge</dt>
                                        <dd>₹{order.codPrice}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-beige pt-4 font-semibold text-base">
                                    <dt>Total Price</dt>
                                    <dd className="text-gold">₹{order.totalPrice}</dd>
                                </div>
                            </dl>
                            
                            {!order.isPaid && order.paymentMethod === "Razorpay" && !isCancelled && (
                                <div className="mt-6">
                                    <Button fullWidth onClick={handlePayNow} disabled={payLoading}>
                                        {payLoading ? "Initiating Payment..." : "Pay Now"}
                                    </Button>
                                </div>
                            )}

                            {/* Return Action */}
                            {order.orderStatus === "delivered" && !order.returnDetails?.isRequested && (
                                <div className="mt-6">
                                    <Button fullWidth onClick={() => setShowReturnModal(true)}>
                                        Request Return
                                    </Button>
                                </div>
                            )}

                            {/* Cancel Order Button */}
                            {!isCancelled && !["shipped", "out for delivery", "delivered", "return requested", "return approved", "returned"].includes(order.orderStatus) && (
                                <div className="mt-4">
                                    <Button variant="ghost" fullWidth onClick={handleCancelOrder} disabled={cancelLoading} className="text-red-500 hover:bg-red-55 w-full">
                                        {cancelLoading ? "Cancelling..." : "Cancel Order"}
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
                                <h3 className="font-semibold text-sm mb-2">Payment Details</h3>
                                <p className="text-sm">Method: {order.paymentMethod}</p>
                                <p className={`text-sm mt-1 font-semibold ${order.isPaid ? 'text-green-600' : 'text-red-500'}`}>
                                    {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : "Not Paid"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RETURN REQUEST MODAL */}
            {showReturnModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white max-w-md w-full rounded-2xl border border-beige p-6 sm:p-8 animate-fade-in shadow-xl">
                        <h3 className="text-2xl font-serif text-foreground mb-4">Request Product Return</h3>
                        <p className="text-sm text-gray-500 mb-6">Please provide a reason for returning your items. Our team will review your request and schedule a reverse pickup.</p>
                        
                        <form onSubmit={handleReturnRequest} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Return *</label>
                                <textarea
                                    value={returnReason}
                                    onChange={e => setReturnReason(e.target.value)}
                                    placeholder="Please describe why you would like to return these items..."
                                    rows={4}
                                    className="w-full border border-beige rounded-xl p-3 text-sm focus:outline-none focus:border-gold resize-none"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowReturnModal(false)}
                                    disabled={submittingReturn}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submittingReturn}
                                >
                                    {submittingReturn ? "Submitting..." : "Submit Request"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
