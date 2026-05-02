"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
    const { user, logout, login } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Profile editing
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateMessage, setUpdateMessage] = useState("");

    // Password change
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        if (!user) {
            router.push("/login?redirect=profile");
        } else {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone || "");

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

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateLoading(true);
        setUpdateMessage("");

        try {
            const { data } = await api.put("/users/profile", { name, email, phone });
            // Update auth context
            login(data);
            setEditing(false);
            setUpdateMessage("Profile updated successfully!");
            setTimeout(() => setUpdateMessage(""), 3000);
        } catch (error: any) {
            setUpdateMessage(error.response?.data?.message || "Failed to update profile");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordMessage("");

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        setPasswordLoading(true);
        try {
            await api.put("/users/password", { currentPassword, newPassword });
            setPasswordMessage("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordForm(false);
            setTimeout(() => setPasswordMessage(""), 3000);
        } catch (error: any) {
            setPasswordError(error.response?.data?.message || "Failed to change password");
        } finally {
            setPasswordLoading(false);
        }
    };

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

                            {editing ? (
                                <form onSubmit={handleProfileUpdate} className="text-left space-y-3 mt-4">
                                    <div>
                                        <label className="block text-xs text-foreground mb-1">Name</label>
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-beige rounded-sm p-2 text-sm focus:outline-none focus:border-gold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-foreground mb-1">Email</label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-beige rounded-sm p-2 text-sm focus:outline-none focus:border-gold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-foreground mb-1">Phone</label>
                                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-beige rounded-sm p-2 text-sm focus:outline-none focus:border-gold" />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button type="submit" size="sm" disabled={updateLoading}>
                                            {updateLoading ? "Saving..." : "Save"}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <h2 className="text-xl font-serif text-foreground mb-1">{user.name}</h2>
                                    <p className="text-sm text-foreground mb-1">{user.email}</p>
                                    {user.phone && <p className="text-xs text-gray-400 mb-4">{user.phone}</p>}

                                    <Button variant="outline" fullWidth className="mb-3" onClick={() => setEditing(true)}>Edit Profile</Button>
                                </>
                            )}

                            {updateMessage && <p className="text-green-600 text-xs mt-2">{updateMessage}</p>}
                            {passwordMessage && <p className="text-green-600 text-xs mt-2">{passwordMessage}</p>}

                            <div className="mt-4 space-y-2">
                                <Button variant="outline" fullWidth size="sm" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                                    {showPasswordForm ? "Cancel" : "Change Password"}
                                </Button>

                                {showPasswordForm && (
                                    <form onSubmit={handlePasswordChange} className="text-left space-y-3 mt-3">
                                        {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
                                        <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border border-beige rounded-sm p-2 text-sm focus:outline-none focus:border-gold" required />
                                        <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-beige rounded-sm p-2 text-sm focus:outline-none focus:border-gold" required />
                                        <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-beige rounded-sm p-2 text-sm focus:outline-none focus:border-gold" required />
                                        <Button type="submit" size="sm" fullWidth disabled={passwordLoading}>
                                            {passwordLoading ? "Updating..." : "Update Password"}
                                        </Button>
                                    </form>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-beige space-y-2">
                                {user.isAdmin && (
                                    <Link href="/admin">
                                        <Button variant="outline" fullWidth className="mb-2">Admin Dashboard</Button>
                                    </Link>
                                )}
                                <Button variant="ghost" fullWidth onClick={logout} className="text-red-500 hover:text-red-700">Logout</Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3">
                        <div className="bg-white p-6 border border-beige rounded-xl shadow-sm mb-8">
                            <h2 className="text-2xl font-serif text-foreground mb-6">Order History</h2>

                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-beige rounded animate-pulse"></div>)}
                                </div>
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
                                                    <td className="py-4 px-4 text-sm text-foreground capitalize">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' : order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-beige text-foreground'}`}>
                                                            {order.orderStatus}
                                                        </span>
                                                    </td>
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
