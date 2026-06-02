"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        pendingRequests: 0,
    });
    const [autoShiprocket, setAutoShiprocket] = useState(true);
    const [loading, setLoading] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsPromise = api.get("/orders/stats/admin");
                const settingsPromise = api.get("/settings");

                const [statsRes, settingsRes] = await Promise.all([statsPromise, settingsPromise]);

                setStats({
                    totalSales: statsRes.data.totalSales,
                    totalOrders: statsRes.data.totalOrders,
                    totalProducts: statsRes.data.totalProducts,
                    pendingRequests: statsRes.data.pendingRequests,
                });

                // Find autoShiprocket setting from settings list
                const autoSR = settingsRes.data.find((s: any) => s.key === "autoShiprocket");
                if (autoSR) {
                    setAutoShiprocket(autoSR.value);
                }
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleToggleShiprocket = async () => {
        setSavingSettings(true);
        const newValue = !autoShiprocket;
        try {
            await api.put(`/settings/autoShiprocket`, { value: newValue });
            setAutoShiprocket(newValue);
            setShowFeedback(true);
            setTimeout(() => setShowFeedback(false), 3000);
        } catch (err) {
            alert("Failed to update setting. Please try again.");
        } finally {
            setSavingSettings(false);
        }
    };

    if (loading) return (
        <div className="space-y-6">
            <div className="h-8 bg-beige rounded w-48 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-beige shadow-sm animate-pulse">
                        <div className="h-3 bg-beige rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-beige rounded w-2/3"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-serif text-foreground mb-8">Dashboard Overview</h1>

            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm">
                    Failed to load stats. Some data may be unavailable.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-beige shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Revenue</h3>
                    <p className="text-3xl font-serif text-foreground">₹{stats.totalSales.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">From paid orders</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-beige shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Orders</h3>
                    <p className="text-3xl font-serif text-foreground">{stats.totalOrders}</p>
                    <p className="text-xs text-gray-400 mt-1">All time</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-beige shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Active Products</h3>
                    <p className="text-3xl font-serif text-foreground">{stats.totalProducts}</p>
                    <p className="text-xs text-gray-400 mt-1">In catalog</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-beige shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Pending Custom Reqs</h3>
                    <p className="text-3xl font-serif text-gold-dark">{stats.pendingRequests}</p>
                    <p className="text-xs text-gray-400 mt-1">Awaiting review</p>
                </div>
            </div>

            {/* Bottom Actions and Settings Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Card 1: Quick Actions */}
                <div className="bg-white p-6 rounded-xl border border-beige shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-serif text-foreground mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <a href="/admin/products" className="block p-3 rounded-lg bg-cream hover:bg-beige transition text-sm text-foreground">
                                📦 Manage Products
                            </a>
                            <a href="/admin/orders" className="block p-3 rounded-lg bg-cream hover:bg-beige transition text-sm text-foreground">
                                📋 View Pending Orders
                            </a>
                            <a href="/admin/custom-requests" className="block p-3 rounded-lg bg-cream hover:bg-beige transition text-sm text-foreground">
                                ✉️ Review Custom Requests
                            </a>
                        </div>
                    </div>
                </div>

                {/* Card 2: Platform Health */}
                <div className="bg-white p-6 rounded-xl border border-beige shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-serif text-foreground mb-4">Platform Health</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-foreground">Average Order Value</span>
                                <span className="font-semibold">₹{stats.totalOrders > 0 ? Math.round(stats.totalSales / stats.totalOrders).toLocaleString() : 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-foreground">Pending Requests Ratio</span>
                                <span className={`font-semibold ${stats.pendingRequests > 5 ? 'text-red-500' : 'text-green-600'}`}>
                                    {stats.pendingRequests} pending
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-foreground">Catalog Size</span>
                                <span className="font-semibold">{stats.totalProducts} products</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Shiprocket Toggle Settings */}
                <div className="bg-white p-6 rounded-xl border border-beige shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-serif text-foreground mb-2 flex items-center space-x-2">
                            <span>🚀 Shiprocket Integration</span>
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">
                            Configure automated fulfillment and courier pickup dispatching.
                        </p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-cream border border-beige">
                                <div>
                                    <span className="text-sm font-medium text-foreground block">Auto-Fulfillment</span>
                                    <span className="text-xs text-gray-400">
                                        {autoShiprocket ? "Fulfillment is automated" : "Fulfillment is manual"}
                                    </span>
                                </div>
                                <button
                                    onClick={handleToggleShiprocket}
                                    disabled={savingSettings}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autoShiprocket ? 'bg-gold' : 'bg-gray-200'} ${savingSettings ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <span className="sr-only">Toggle Shiprocket Auto-Fulfillment</span>
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoShiprocket ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-beige">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Status:</span>
                            {savingSettings ? (
                                <span className="text-gold font-medium animate-pulse">Saving...</span>
                            ) : showFeedback ? (
                                <span className="text-green-600 font-medium animate-fade-in flex items-center">
                                    ✓ Saved successfully
                                </span>
                            ) : (
                                <span className={`font-semibold ${autoShiprocket ? 'text-green-600' : 'text-amber-600'}`}>
                                    {autoShiprocket ? "Active (Auto-Pickup)" : "Paused (Manual Confirm)"}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">
                            {autoShiprocket 
                                ? "Incoming orders automatically create Shiprocket shipments and schedule pickups." 
                                : "Incoming orders are saved locally. You must manually confirm/schedule them in Orders."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
