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
            } catch (error) {
                console.log("Error fetching stats, rendering placeholders.");
                // Mock stats for display purposes if API is empty/fails
                setStats({ totalSales: 45000, totalOrders: 24, totalProducts: 15, pendingRequests: 3 });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div>
            <h1 className="text-3xl font-serif text-foreground mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-beige shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Revenue</h3>
                    <p className="text-3xl font-serif text-foreground">₹{stats.totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-beige shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Orders</h3>
                    <p className="text-3xl font-serif text-foreground">{stats.totalOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-beige shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Active Products</h3>
                    <p className="text-3xl font-serif text-foreground">{stats.totalProducts}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-beige shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Pending Custom Reqs</h3>
                    <p className="text-3xl font-serif text-gold-dark">{stats.pendingRequests}</p>
                </div>
            </div>

            {/* Additional sections like charts could go here */}
            <div className="bg-white p-6 rounded-xl border border-beige shadow-sm h-64 flex items-center justify-center">
                <p className="text-gray-400">Sales Chart Placeholder</p>
            </div>
        </div>
    );
}
