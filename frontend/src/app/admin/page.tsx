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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get("/orders/stats/admin");
                setStats({
                    totalSales: data.totalSales,
                    totalOrders: data.totalOrders,
                    totalProducts: data.totalProducts,
                    pendingRequests: data.pendingRequests,
                });
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

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

            {/* Quick Stats Summary instead of placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-beige shadow-sm">
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
                <div className="bg-white p-6 rounded-xl border border-beige shadow-sm">
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
        </div>
    );
}
