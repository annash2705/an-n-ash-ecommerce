"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/Button";

interface ShippingSettings {
    rule: string;
    freeShippingThreshold: number;
    defaultWeight: number;
    defaultLength: number;
    defaultWidth: number;
    defaultHeight: number;
    expressDeliveryEnabled: boolean;
    expressDeliveryCharges: number;
    codAvailable: boolean;
    pickupLocation: string;
}

export default function AdminShippingPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [settings, setSettings] = useState<ShippingSettings>({
        rule: "threshold",
        freeShippingThreshold: 999,
        defaultWeight: 0.1,
        defaultLength: 10,
        defaultWidth: 10,
        defaultHeight: 10,
        expressDeliveryEnabled: true,
        expressDeliveryCharges: 150,
        codAvailable: true,
        pickupLocation: "Home",
    });
    const [autoShiprocket, setAutoShiprocket] = useState(false);
    
    const [activeTab, setActiveTab] = useState<"pending" | "returns" | "analytics" | "settings">("pending");
    const [loading, setLoading] = useState(true);
    const [loadingRates, setLoadingRates] = useState<Record<string, boolean>>({});
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [rates, setRates] = useState<Record<string, any[]>>({});
    const [fulfilling, setFulfilling] = useState<Record<string, boolean>>({});
    const [resolvingReturn, setResolvingReturn] = useState<Record<string, boolean>>({});
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "pending" || activeTab === "returns") {
                const { data } = await api.get("/orders");
                setOrders(data);
            } else if (activeTab === "analytics") {
                const { data } = await api.get("/shipping/analytics");
                setAnalytics(data);
            } else if (activeTab === "settings") {
                const { data: settingsList } = await api.get("/settings");
                const shipSettings = settingsList.find((s: any) => s.key === "shippingSettings");
                if (shipSettings) setSettings(shipSettings.value);
                const autoSR = settingsList.find((s: any) => s.key === "autoShiprocket");
                if (autoSR) setAutoShiprocket(autoSR.value);
            }
        } catch (error) {
            console.error("Error fetching admin shipping data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchRates = async (orderId: string, pincode: string, items: any[], paymentMethod: string) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
            return;
        }
        setExpandedOrder(orderId);
        if (rates[orderId]) return;

        setLoadingRates(prev => ({ ...prev, [orderId]: true }));
        try {
            const { data } = await api.post("/shipping/calculate-rates", {
                pincode,
                items,
                paymentMethod,
                adminMode: true,
            });
            if (data.serviceable) {
                setRates(prev => ({ ...prev, [orderId]: data.rates }));
            } else {
                alert(data.message || "This location is not serviceable.");
                setRates(prev => ({ ...prev, [orderId]: [] }));
            }
        } catch (error) {
            alert("Failed to calculate shipping rates.");
        } finally {
            setLoadingRates(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const handleCustomFulfillment = async (orderId: string, courierId: number) => {
        setFulfilling(prev => ({ ...prev, [orderId]: true }));
        try {
            await api.post(`/orders/${orderId}/create-fulfillment-custom`, { courierId });
            alert("Shiprocket shipment created successfully!");
            setExpandedOrder(null);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to create custom fulfillment.");
        } finally {
            setFulfilling(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const handleAutoFulfillment = async (orderId: string) => {
        setFulfilling(prev => ({ ...prev, [orderId]: true }));
        try {
            await api.post(`/orders/${orderId}/retry-fulfillment`);
            alert("Automated Shiprocket shipment created successfully!");
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to auto-assign courier.");
        } finally {
            setFulfilling(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const handleResolveReturn = async (orderId: string, status: "Approved" | "Rejected") => {
        setResolvingReturn(prev => ({ ...prev, [orderId]: true }));
        try {
            await api.put(`/orders/${orderId}/return-status`, { status });
            alert(`Return request has been ${status.toLowerCase()}!`);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to resolve return request.");
        } finally {
            setResolvingReturn(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            await api.put("/settings/shippingSettings", { value: settings });
            await api.put("/settings/autoShiprocket", { value: autoShiprocket });
            alert("Settings updated successfully!");
            fetchData();
        } catch (error) {
            alert("Failed to save shipping settings.");
        } finally {
            setSavingSettings(false);
        }
    };

    // Filter pending shipments
    const pendingOrders = orders.filter((order: any) => 
        !["cancelled", "delivered", "returned"].includes(order.orderStatus) && !order.shipmentId
    );

    // Filter return requests
    const returnOrders = orders.filter((order: any) => 
        order.returnDetails?.isRequested === true || ["return requested", "return approved", "return rejected", "returned"].includes(order.orderStatus)
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif text-foreground mb-8">Shipping & Fulfillment</h1>

            {/* Navigation Tabs */}
            <div className="flex space-x-6 border-b border-beige mb-8">
                {(["pending", "returns", "analytics", "settings"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-1 text-sm tracking-wider uppercase font-medium transition-colors border-b-2 ${
                            activeTab === tab ? "border-gold text-gold-dark" : "border-transparent text-gray-500 hover:text-foreground"
                        }`}
                    >
                        {tab === "pending" && "Pending Shipments"}
                        {tab === "returns" && "Returns"}
                        {tab === "analytics" && "Analytics"}
                        {tab === "settings" && "Settings"}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-beige/30 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <>
                    {/* PENDING SHIPMENTS */}
                    {activeTab === "pending" && (
                        <div className="card-premium p-6 sm:p-8 bg-white border border-beige rounded-xl shadow-sm">
                            <h2 className="text-xl font-serif mb-6 text-foreground">Orders Awaiting Courier Assignment</h2>
                            {pendingOrders.length === 0 ? (
                                <p className="text-center py-10 text-gray-400">All orders have been fulfilled.</p>
                            ) : (
                                <div className="space-y-6">
                                    {pendingOrders.map((order: any) => (
                                        <div key={order._id} className="border border-beige rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-semibold text-foreground">Order ID: #{order._id.substring(0, 8)}...</span>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.paymentMethod === 'Cash on Delivery' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {order.paymentMethod === 'Cash on Delivery' ? 'COD' : 'Prepaid'}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {order.isPaid ? 'Paid' : 'Unpaid'}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-2">
                                                        <p>Customer: <span className="font-medium text-foreground">{order.shippingAddress?.name}</span></p>
                                                        <p>Destination: {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                                                        <p>Items: {order.orderItems?.map((i: any) => `${i.qty}x ${i.name}`).join(", ")}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 self-end md:self-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleFetchRates(order._id, order.shippingAddress.pincode, order.orderItems, order.paymentMethod)}
                                                        disabled={fulfilling[order._id]}
                                                    >
                                                        {loadingRates[order._id] ? "Loading Rates..." : expandedOrder === order._id ? "Close Couriers" : "Manual Select"}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAutoFulfillment(order._id)}
                                                        disabled={fulfilling[order._id]}
                                                    >
                                                        {fulfilling[order._id] ? "Processing..." : "Auto Assign Best"}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Expandable Courier list */}
                                            {expandedOrder === order._id && (
                                                <div className="mt-6 border-t border-beige pt-6">
                                                    <h3 className="text-md font-serif text-gold-dark mb-4">Select Courier Service</h3>
                                                    {!rates[order._id] || rates[order._id].length === 0 ? (
                                                        <p className="text-gray-400 text-sm">No serviceable couriers found.</p>
                                                    ) : (
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-left border-collapse text-sm">
                                                                <thead>
                                                                    <tr className="bg-cream/40 border-b border-beige">
                                                                        <th className="py-2 px-3">Courier</th>
                                                                        <th className="py-2 px-3">Rating</th>
                                                                        <th className="py-2 px-3">Est. Delivery</th>
                                                                        <th className="py-2 px-3">Cost</th>
                                                                        <th className="py-2 px-3 text-right">Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {rates[order._id].map((rateItem: any) => (
                                                                        <tr key={rateItem.courierId} className="border-b border-beige last:border-0 hover:bg-cream/10">
                                                                            <td className="py-3 px-3 font-medium text-foreground">{rateItem.name}</td>
                                                                            <td className="py-3 px-3 text-gold">★ {rateItem.rating}</td>
                                                                            <td className="py-3 px-3">{rateItem.deliveryDays} Days</td>
                                                                            <td className="py-3 px-3 font-semibold text-foreground">₹{rateItem.cost}</td>
                                                                            <td className="py-3 px-3 text-right">
                                                                                <Button
                                                                                    size="sm"
                                                                                    onClick={() => handleCustomFulfillment(order._id, rateItem.courierId)}
                                                                                    disabled={fulfilling[order._id]}
                                                                                >
                                                                                    Ship with this
                                                                                </Button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* RETURNS */}
                    {activeTab === "returns" && (
                        <div className="card-premium p-6 sm:p-8 bg-white border border-beige rounded-xl shadow-sm">
                            <h2 className="text-xl font-serif mb-6 text-foreground">Customer Return Requests</h2>
                            {returnOrders.length === 0 ? (
                                <p className="text-center py-10 text-gray-400">No return requests found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-cream border-b border-beige">
                                                <th className="py-3 px-4">Order ID</th>
                                                <th className="py-3 px-4">Customer</th>
                                                <th className="py-3 px-4">Reason</th>
                                                <th className="py-3 px-4">Requested Date</th>
                                                <th className="py-3 px-4">Status</th>
                                                <th className="py-3 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {returnOrders.map((order: any) => (
                                                <tr key={order._id} className="border-b border-beige hover:bg-gray-50">
                                                    <td className="py-4 px-4 font-medium">#{order._id.substring(0, 8)}...</td>
                                                    <td className="py-4 px-4">{order.shippingAddress?.name}</td>
                                                    <td className="py-4 px-4 italic text-gray-600">"{order.returnDetails?.reason || order.orderStatus}"</td>
                                                    <td className="py-4 px-4">{order.returnDetails?.requestedAt ? new Date(order.returnDetails.requestedAt).toLocaleDateString() : new Date().toLocaleDateString()}</td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                            order.returnDetails?.status === "Approved" || order.returnDetails?.status === "Completed" || order.returnDetails?.status === "Pickup Scheduled"
                                                                ? "bg-green-100 text-green-800"
                                                                : order.returnDetails?.status === "Rejected"
                                                                ? "bg-red-100 text-red-800"
                                                                : "bg-amber-100 text-amber-800"
                                                        }`}>
                                                            {order.returnDetails?.status || "Pending"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right space-x-2">
                                                        {(order.orderStatus === "return requested" || order.returnDetails?.status === "Pending") && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-red-300 hover:bg-red-50 text-red-600"
                                                                    onClick={() => handleResolveReturn(order._id, "Rejected")}
                                                                    disabled={resolvingReturn[order._id]}
                                                                >
                                                                    Reject
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleResolveReturn(order._id, "Approved")}
                                                                    disabled={resolvingReturn[order._id]}
                                                                >
                                                                    Approve & Return
                                                                </Button>
                                                            </>
                                                        )}
                                                        {order.returnDetails?.reverseAwbCode && (
                                                            <div className="text-xs text-gray-500">
                                                                <p className="font-semibold text-foreground">Reverse AWB:</p>
                                                                <p>{order.returnDetails.reverseAwbCode}</p>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ANALYTICS */}
                    {activeTab === "analytics" && analytics && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="card-premium p-5 bg-white border border-beige rounded-xl flex flex-col justify-between h-28 shadow-sm">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Total Shipments</p>
                                    <p className="text-3xl font-serif text-foreground font-bold">{analytics.totalShipments}</p>
                                </div>
                                <div className="card-premium p-5 bg-white border border-beige rounded-xl flex flex-col justify-between h-28 shadow-sm">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Delivered Orders</p>
                                    <p className="text-3xl font-serif text-foreground font-bold">{analytics.deliveredOrders}</p>
                                </div>
                                <div className="card-premium p-5 bg-white border border-beige rounded-xl flex flex-col justify-between h-28 shadow-sm">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Return Rate</p>
                                    <p className="text-3xl font-serif text-foreground font-bold">{analytics.returnRate}%</p>
                                </div>
                                <div className="card-premium p-5 bg-white border border-beige rounded-xl flex flex-col justify-between h-28 shadow-sm">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Average Delivery Speed</p>
                                    <p className="text-3xl font-serif text-foreground font-bold">{analytics.averageDeliveryTime} Days</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="card-premium p-5 bg-white border border-beige rounded-xl flex flex-col justify-between h-28 shadow-sm">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Shipping Revenue</p>
                                    <p className="text-3xl font-serif text-green-600 font-bold">₹{analytics.shippingRevenue}</p>
                                </div>
                                <div className="card-premium p-5 bg-white border border-beige rounded-xl flex flex-col justify-between h-28 shadow-sm">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Estimated Shipping Cost</p>
                                    <p className="text-3xl font-serif text-red-600 font-bold">₹{analytics.shippingExpenses}</p>
                                </div>
                            </div>

                            <div className="card-premium p-6 sm:p-8 bg-white border border-beige rounded-xl shadow-sm">
                                <h3 className="text-lg font-serif text-foreground mb-4">Recent API Transaction Logs</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-cream border-b border-beige">
                                                <th className="py-2.5 px-3">Endpoint</th>
                                                <th className="py-2.5 px-3">Method</th>
                                                <th className="py-2.5 px-3">Code</th>
                                                <th className="py-2.5 px-3">Status</th>
                                                <th className="py-2.5 px-3">Timestamp</th>
                                                <th className="py-2.5 px-3">Customer</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analytics.recentLogs?.map((log: any) => (
                                                <tr key={log.id} className="border-b border-beige last:border-0 hover:bg-gray-50">
                                                    <td className="py-2 px-3 font-semibold font-mono text-gray-700">{log.endpoint}</td>
                                                    <td className="py-2 px-3"><span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-bold">{log.method}</span></td>
                                                    <td className="py-2 px-3 font-bold">{log.statusCode}</td>
                                                    <td className="py-2 px-3">
                                                        <span className={`px-1.5 py-0.5 rounded font-medium ${log.status === "Success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-3 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                                    <td className="py-2 px-3">{log.customer}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SETTINGS */}
                    {activeTab === "settings" && (
                        <form onSubmit={handleSaveSettings} className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Configuration Options */}
                                <div className="card-premium p-6 sm:p-8 bg-white border border-beige rounded-xl shadow-sm space-y-6">
                                    <h2 className="text-xl font-serif mb-4 text-foreground">Fulfillment Automation Rules</h2>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping Charges Logic</label>
                                        <select
                                            value={settings.rule}
                                            onChange={e => setSettings({ ...settings, rule: e.target.value })}
                                            className="w-full border border-beige rounded-xl p-2.5 bg-white text-sm focus:outline-none focus:border-gold"
                                        >
                                            <option value="full">Charge standard courier rates directly to user</option>
                                            <option value="threshold">Free shipping above a threshold, else standard rate</option>
                                            <option value="partial">Charge half of standard rate (partial subsidy)</option>
                                            <option value="free">Always free shipping (100% subsidy)</option>
                                        </select>
                                    </div>

                                    {settings.rule === "threshold" && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Free Shipping Threshold (₹)</label>
                                            <input
                                                type="number"
                                                value={settings.freeShippingThreshold}
                                                onChange={e => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                                                className="w-full border border-beige rounded-xl p-2.5 text-sm focus:outline-none focus:border-gold"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between p-3 bg-cream/30 rounded-xl">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Auto-Fulfill with Shiprocket</p>
                                            <p className="text-xs text-gray-500">Automatically create shipments for paid/COD orders.</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={autoShiprocket}
                                            onChange={e => setAutoShiprocket(e.target.checked)}
                                            className="text-gold focus:ring-gold h-5 w-5 rounded border-beige"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-cream/30 rounded-xl">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Accept Cash on Delivery (COD)</p>
                                            <p className="text-xs text-gray-500">Allow customers to choose Cash on Delivery at checkout.</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.codAvailable}
                                            onChange={e => setSettings({ ...settings, codAvailable: e.target.checked })}
                                            className="text-gold focus:ring-gold h-5 w-5 rounded border-beige"
                                        />
                                    </div>
                                </div>

                                {/* Default Dimensions */}
                                <div className="card-premium p-6 sm:p-8 bg-white border border-beige rounded-xl shadow-sm space-y-6">
                                    <h2 className="text-xl font-serif mb-4 text-foreground">Fallback Physical Configurations</h2>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight Fallback (kg)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={settings.defaultWeight}
                                                onChange={e => setSettings({ ...settings, defaultWeight: Number(e.target.value) })}
                                                className="w-full border border-beige rounded-xl p-2.5 text-sm focus:outline-none focus:border-gold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup Location Name</label>
                                            <input
                                                type="text"
                                                value={settings.pickupLocation}
                                                onChange={e => setSettings({ ...settings, pickupLocation: e.target.value })}
                                                className="w-full border border-beige rounded-xl p-2.5 text-sm focus:outline-none focus:border-gold"
                                                placeholder="Shiprocket Pickup ID"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Length (cm)</label>
                                            <input
                                                type="number"
                                                value={settings.defaultLength}
                                                onChange={e => setSettings({ ...settings, defaultLength: Number(e.target.value) })}
                                                className="w-full border border-beige rounded-xl p-2.5 text-sm focus:outline-none focus:border-gold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Width (cm)</label>
                                            <input
                                                type="number"
                                                value={settings.defaultWidth}
                                                onChange={e => setSettings({ ...settings, defaultWidth: Number(e.target.value) })}
                                                className="w-full border border-beige rounded-xl p-2.5 text-sm focus:outline-none focus:border-gold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Height (cm)</label>
                                            <input
                                                type="number"
                                                value={settings.defaultHeight}
                                                onChange={e => setSettings({ ...settings, defaultHeight: Number(e.target.value) })}
                                                className="w-full border border-beige rounded-xl p-2.5 text-sm focus:outline-none focus:border-gold"
                                            />
                                        </div>
                                    </div>

                                    <hr className="border-beige/55 my-2" />

                                    <div className="flex items-center justify-between p-3 bg-cream/30 rounded-xl">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Express Delivery Option</p>
                                            <p className="text-xs text-gray-500">Allow customers to upgrade delivery speeds at checkout.</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.expressDeliveryEnabled}
                                            onChange={e => setSettings({ ...settings, expressDeliveryEnabled: e.target.checked })}
                                            className="text-gold focus:ring-gold h-5 w-5 rounded border-beige"
                                        />
                                    </div>

                                    {settings.expressDeliveryEnabled && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Express Shipping Surcharge (₹)</label>
                                            <input
                                                type="number"
                                                value={settings.expressDeliveryCharges}
                                                onChange={e => setSettings({ ...settings, expressDeliveryCharges: Number(e.target.value) })}
                                                className="w-full border border-beige rounded-xl p-2.5 text-sm focus:outline-none focus:border-gold"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" size="lg" disabled={savingSettings}>
                                    {savingSettings ? "Saving Settings..." : "Save Configuration"}
                                </Button>
                            </div>
                        </form>
                    )}
                </>
            )}
        </div>
    );
}
