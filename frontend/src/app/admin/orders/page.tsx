"use client";

import { useEffect, useState, Fragment } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/Button";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

    // Track which orders have had their labels "printed" in this session
    const [printedLabels, setPrintedLabels] = useState<Record<string, boolean>>({});
    const [retryingFulfillment, setRetryingFulfillment] = useState<Record<string, boolean>>({});
    const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get("/orders");
            setOrders(data);
        } catch (error) {
            console.log("Error fetching orders");
        } finally {
            setLoading(false);
        }
    };

    const statusChangeHandler = async (id: string, newStatus: string) => {
        try {
            await api.put(`/orders/${id}/status`, { status: newStatus });
            fetchOrders();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const handlePrintLabel = async (id: string) => {
        try {
            const { data } = await api.post(`/orders/${id}/generate-label`);
            if (data.label_url) {
                window.open(data.label_url, '_blank');
                setPrintedLabels(prev => ({ ...prev, [id]: true }));
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Failed to generate label. The order may not have a Shiprocket shipment yet.";
            alert(errorMsg);
        }
    };

    const handleMarkPickedUp = async (id: string) => {
        await statusChangeHandler(id, "shipped");
        alert("Order marked as Picked Up! Customer tracking updated.");
    };

    const handleRetryFulfillment = async (id: string) => {
        setRetryingFulfillment(prev => ({ ...prev, [id]: true }));
        try {
            await api.post(`/orders/${id}/retry-fulfillment`);
            alert("Shiprocket fulfillment successful! Shipment created.");
            fetchOrders();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Failed to create shipment. Make sure your Shiprocket dashboard settings are correct.";
            alert(errorMsg);
        } finally {
            setRetryingFulfillment(prev => ({ ...prev, [id]: false }));
        }
    };

    // Filter orders based on active tab
    const displayedOrders = orders.filter((order: any) =>
        activeTab === 'pending'
            ? !['delivered', 'cancelled'].includes(order.orderStatus)
            : ['delivered', 'cancelled'].includes(order.orderStatus)
    );

    // Determine what action button to show
    const getActionButton = (order: any) => {
        // For Razorpay orders that haven't been paid yet
        if (order.paymentMethod === "Razorpay" && !order.isPaid) {
            return <span className="text-xs text-gray-400 italic">Awaiting payment</span>;
        }

        // No shipment ID — can't print label (needs sync)
        if (!order.shipmentId) {
            return (
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRetryFulfillment(order._id);
                    }}
                    disabled={retryingFulfillment[order._id]}
                >
                    {retryingFulfillment[order._id] ? "Syncing..." : "Sync to Shiprocket"}
                </Button>
            );
        }

        // Synced but courier has not assigned AWB yet
        if (!order.trackingId) {
            return <span className="text-xs text-amber-600 font-medium italic">Synced (Assign Courier on Shiprocket)</span>;
        }

        // Label already printed this session
        if (printedLabels[order._id]) {
            return (
                <Button 
                    className="bg-green-600 hover:bg-green-700 text-white" 
                    size="sm" 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleMarkPickedUp(order._id);
                    }}
                >
                    Mark Picked Up
                </Button>
            );
        }

        // Default: show print label
        return (
            <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                    e.stopPropagation();
                    handlePrintLabel(order._id);
                }}
            >
                Print Label
            </Button>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif text-foreground">Order Management</h1>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-beige">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-2 px-1 text-sm tracking-wider uppercase font-medium transition-colors border-b-2 ${activeTab === 'pending' ? 'border-gold text-gold-dark' : 'border-transparent text-gray-500 hover:text-foreground'}`}
                >
                    Active Orders
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`pb-2 px-1 text-sm tracking-wider uppercase font-medium transition-colors border-b-2 ${activeTab === 'completed' ? 'border-gold text-gold-dark' : 'border-transparent text-gray-500 hover:text-foreground'}`}
                >
                    Completed / Cancelled
                </button>
            </div>

            <div className="bg-white border border-beige rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-beige rounded animate-pulse"></div>)}
                    </div>
                ) : (
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-cream border-b border-beige">
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">ID</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">USER</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">DATE</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">TOTAL</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">METHOD</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">PAID</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">STATUS</th>
                                    {activeTab === 'pending' && <th className="py-3 px-4 text-sm font-semibold text-foreground text-right">ACTION</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {displayedOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-10 text-gray-400">No {activeTab} orders found.</td>
                                    </tr>
                                ) : displayedOrders.map((order: any) => (
                                    <Fragment key={order._id}>
                                        <tr 
                                            onClick={() => setExpandedOrders(prev => ({ ...prev, [order._id]: !prev[order._id] }))}
                                            className="border-b border-beige last:border-b-0 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <td className="py-4 px-4 text-sm text-foreground">
                                                <span className="mr-1.5 text-xs text-gold-dark font-medium">
                                                    {expandedOrders[order._id] ? "▲" : "▼"}
                                                </span>
                                                {order._id.substring(0, 8)}...
                                            </td>
                                            <td className="py-4 px-4 text-sm text-foreground font-medium">{order.shippingAddress?.name}</td>
                                            <td className="py-4 px-4 text-sm text-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="py-4 px-4 text-sm text-foreground font-medium">₹{order.totalPrice}</td>
                                            <td className="py-4 px-4 text-sm">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.paymentMethod === 'Cash on Delivery' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {order.paymentMethod === 'Cash on Delivery' ? 'COD' : 'Prepaid'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm">
                                                <span className={order.isPaid ? 'text-green-600 font-medium' : 'text-red-500'}>
                                                    {order.isPaid ? '✓ Paid' : 'Unpaid'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm">
                                                {order.orderStatus === 'cancelled' ? (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">Cancelled</span>
                                                ) : activeTab === 'pending' ? (
                                                    <select
                                                        value={order.orderStatus}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => statusChangeHandler(order._id, e.target.value)}
                                                        className="border border-beige rounded-sm p-1 text-sm bg-white focus:outline-none focus:border-gold"
                                                    >
                                                        <option value="order placed">Order Placed</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="packed">Packed</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="out for delivery">Out for Delivery</option>
                                                        <option value="delivered">Delivered</option>
                                                    </select>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        {order.orderStatus}
                                                    </span>
                                                )}
                                            </td>
                                            {activeTab === 'pending' && (
                                                <td className="py-4 px-4 text-sm text-right">
                                                    {getActionButton(order)}
                                                </td>
                                            )}
                                        </tr>
                                        {expandedOrders[order._id] && (
                                            <tr className="bg-cream/20 border-b border-beige">
                                                <td colSpan={activeTab === 'pending' ? 8 : 7} className="py-6 px-6 text-sm text-foreground">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                                        {/* Items Column */}
                                                        <div className="space-y-3">
                                                            <h4 className="font-semibold text-gold-dark text-xs uppercase tracking-wider border-b border-beige pb-1">
                                                                Items Ordered
                                                            </h4>
                                                            <ul className="space-y-2">
                                                                {order.orderItems?.map((item: any, idx: number) => (
                                                                    <li key={idx} className="flex justify-between items-center text-xs">
                                                                        <span className="text-gray-700 font-medium">
                                                                            {item.qty} x {item.name}
                                                                        </span>
                                                                        <span className="text-gray-900">
                                                                            ₹{item.price * item.qty}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            <div className="border-t border-beige/60 pt-2 space-y-1 text-xs">
                                                                <div className="flex justify-between text-gray-500">
                                                                    <span>Subtotal:</span>
                                                                    <span>₹{order.itemsPrice}</span>
                                                                </div>
                                                                {order.codPrice > 0 && (
                                                                    <div className="flex justify-between text-amber-700 font-medium">
                                                                        <span>COD Surcharge:</span>
                                                                        <span>+₹{order.codPrice}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between font-bold text-foreground text-sm pt-1 border-t border-beige/40">
                                                                    <span>Total:</span>
                                                                    <span className="text-gold-dark">₹{order.totalPrice}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Address Column */}
                                                        <div className="space-y-3">
                                                            <h4 className="font-semibold text-gold-dark text-xs uppercase tracking-wider border-b border-beige pb-1">
                                                                Shipping Address
                                                            </h4>
                                                            <div className="text-xs space-y-1.5 text-gray-700">
                                                                <p className="font-semibold text-foreground">{order.shippingAddress?.name}</p>
                                                                <p>{order.shippingAddress?.street}</p>
                                                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                                                                <div className="pt-2 border-t border-beige/60 space-y-1 text-[11px] text-gray-500">
                                                                    <p><strong>Phone:</strong> {order.shippingAddress?.phone}</p>
                                                                    <p><strong>Email:</strong> {order.shippingAddress?.email}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Shiprocket Status Column */}
                                                        <div className="space-y-3">
                                                            <h4 className="font-semibold text-gold-dark text-xs uppercase tracking-wider border-b border-beige pb-1">
                                                                Shiprocket Integration
                                                            </h4>
                                                            {order.shiprocketOrderId ? (
                                                                <div className="text-xs space-y-2 text-gray-700">
                                                                    <p><strong>Order ID:</strong> {order.shiprocketOrderId}</p>
                                                                    <p><strong>Shipment ID:</strong> {order.shipmentId || "N/A"}</p>
                                                                    <p><strong>AWB Code (Tracking):</strong> {order.trackingId ? (
                                                                        <span className="font-mono bg-beige/40 px-1.5 py-0.5 rounded border border-beige/60 font-semibold">{order.trackingId}</span>
                                                                    ) : (
                                                                        <span className="text-amber-600 font-medium italic">Awaiting Courier Assignment</span>
                                                                    )}</p>
                                                                    {order.courierName && <p><strong>Courier Name:</strong> {order.courierName}</p>}
                                                                    {order.trackingUrl && (
                                                                        <div className="pt-2">
                                                                            <a 
                                                                                href={order.trackingUrl} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer" 
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="inline-flex items-center text-gold-dark font-medium hover:underline"
                                                                            >
                                                                                Track Package ↗
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs space-y-2">
                                                                    <p className="text-red-500 italic">Not Synced with Shiprocket</p>
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm" 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleRetryFulfillment(order._id);
                                                                        }}
                                                                        disabled={retryingFulfillment[order._id]}
                                                                    >
                                                                        {retryingFulfillment[order._id] ? "Syncing..." : "Sync to Shiprocket"}
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
