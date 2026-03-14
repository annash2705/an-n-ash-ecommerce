"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/login?redirect=profile");
        } else {
            const fetchMyOrders = async () => {
                try {
                    const { data } = await api.get("/orders/myorders");
                    setOrders(data);
                } catch (error) {
                    console.log("Error fetching orders");
                } finally {
                    setLoading(false);
                }
            };
            fetchMyOrders();
        }
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="bg-cream min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="md:grid md:grid-cols-4 md:gap-8">
                    {/* Sidebar */}
                    <div className="mb-8 md:mb-0">
                        <div className="bg-white p-6 border border-beige rounded-xl shadow-sm text-center">
                            <div className="w-20 h-20 bg-pink-soft rounded-full mx-auto flex items-center justify-center text-3xl text-gold-dark font-serif mb-4">
                                {user.name.charAt(0)}
                            </div>
                            <h2 className="text-xl font-serif text-foreground mb-1">{user.name}</h2>
                            <p className="text-sm text-foreground mb-6">{user.email}</p>

                            {user.isAdmin && (
                                <Link href="/admin">
                                    <Button variant="outline" fullWidth className="mb-3">Admin Dashboard</Button>
                                </Link>
                            )}
                            <Button variant="ghost" fullWidth onClick={logout} className="text-red-500 hover:text-red-700">Logout</Button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3">
                        <div className="bg-white p-6 border border-beige rounded-xl shadow-sm mb-8">
                            <h2 className="text-2xl font-serif text-foreground mb-6">Order History</h2>

                            {loading ? (
                                <p>Loading orders...</p>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-foreground mb-4">You haven't placed any orders yet.</p>
                                    <Link href="/shop"><Button variant="outline">Start Shopping</Button></Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-beige">
                                                <th className="py-3 px-4 text-sm font-semibold text-foreground uppercase tracking-wider">ID</th>
                                                <th className="py-3 px-4 text-sm font-semibold text-foreground uppercase tracking-wider">Date</th>
                                                <th className="py-3 px-4 text-sm font-semibold text-foreground uppercase tracking-wider">Total</th>
                                                <th className="py-3 px-4 text-sm font-semibold text-foreground uppercase tracking-wider">Paid</th>
                                                <th className="py-3 px-4 text-sm font-semibold text-foreground uppercase tracking-wider">Status</th>
                                                <th className="py-3 px-4 text-sm font-semibold text-foreground uppercase tracking-wider"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order: any) => (
                                                <tr key={order._id} className="border-b border-beige last:border-b-0">
                                                    <td className="py-4 px-4 text-sm font-medium text-foreground">{order._id.substring(0, 8)}...</td>
                                                    <td className="py-4 px-4 text-sm text-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    <td className="py-4 px-4 text-sm text-foreground">₹{order.totalPrice}</td>
                                                    <td className="py-4 px-4 text-sm text-foreground">
                                                        {order.isPaid ? (
                                                            <span className="text-green-600">Yes</span>
                                                        ) : (
                                                            <span className="text-red-500">No</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-foreground capitalize">{order.orderStatus}</td>
                                                    <td className="py-4 px-4 text-sm text-right">
                                                        <Link href={`/order/${order._id}`}>
                                                            <Button variant="outline" size="sm">Details</Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
