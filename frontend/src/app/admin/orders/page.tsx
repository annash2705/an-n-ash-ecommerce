"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/Button";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

    // Track which orders have had their labels "printed" in this session
    const [printedLabels, setPrintedLabels] = useState<Record<string, boolean>>({});

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
            const errorMsg = error.response?.data?.message || "Failed to generate label or order hasn't been assigned an AWB yet.";
            alert(`Shiprocket Error: ${errorMsg}`);
        }
    };

    const handleMarkPickedUp = async (id: string) => {
        // Update order to "shipped" to reflect on customer side
        await statusChangeHandler(id, "shipped");
        alert("Order marked as Picked Up! Customer tracking updated.");
    };

    // Filter orders based on active tab
    const displayedOrders = orders.filter((order: any) =>
        activeTab === 'pending' ? order.orderStatus !== 'delivered' : order.orderStatus === 'delivered'
    );

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
                    Pending Orders
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`pb-2 px-1 text-sm tracking-wider uppercase font-medium transition-colors border-b-2 ${activeTab === 'completed' ? 'border-gold text-gold-dark' : 'border-transparent text-gray-500 hover:text-foreground'}`}
                >
                    Completed Orders
                </button>
            </div>

            <div className="bg-white border border-beige rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <p className="p-6">Loading orders...</p>
                ) : (
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-cream border-b border-beige">
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">ID</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">USER</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">DATE</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">TOTAL</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">STATUS</th>
                                    {activeTab === 'pending' && <th className="py-3 px-4 text-sm font-semibold text-foreground text-right">ACTION</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {displayedOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-gray-400">No {activeTab} orders found.</td>
                                    </tr>
                                ) : displayedOrders.map((order: any) => (
                                    <tr key={order._id} className="border-b border-beige last:border-b-0 hover:bg-gray-50">
                                        <td className="py-4 px-4 text-sm text-foreground">{order._id.substring(0, 8)}...</td>
                                        <td className="py-4 px-4 text-sm text-foreground font-medium">{order.shippingAddress?.name}</td>
                                        <td className="py-4 px-4 text-sm text-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="py-4 px-4 text-sm text-foreground">₹{order.totalPrice}</td>
                                        <td className="py-4 px-4 text-sm">
                                            <select
                                                value={order.orderStatus}
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
                                        </td>
                                        {activeTab === 'pending' && (
                                            <td className="py-4 px-4 text-sm text-right space-x-2">
                                                {!printedLabels[order._id] ? (
                                                    <Button variant="outline" size="sm" onClick={() => handlePrintLabel(order._id)}>
                                                        Print Label
                                                    </Button>
                                                ) : (
                                                    <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={() => handleMarkPickedUp(order._id)}>
                                                        Mark Picked Up
                                                    </Button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
