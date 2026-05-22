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
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateMessage, setUpdateMessage] = useState("");
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Tab State: "orders" | "addresses"
    const [activeTab, setActiveTab] = useState<"orders" | "addresses">("orders");

    // Address Management States
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [showAddAddressForm, setShowAddAddressForm] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [locationMessage, setLocationMessage] = useState("");
    const [addressError, setAddressError] = useState("");

    const [newAddress, setNewAddress] = useState({
        name: "",
        phone: "",
        email: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        isDefault: false
    });

    useEffect(() => {
        if (!user) {
            router.push("/login?redirect=profile");
            return;
        }
        
        setName(user.name);
        setEmail(user.email);
        setPhone(user.phone || "");

        const fetchInitialData = async () => {
            try {
                // Fetch Orders
                const { data: ordersData } = await api.get("/orders/myorders");
                setOrders(ordersData);

                // Fetch Profile for Addresses
                const { data: profileData } = await api.get("/users/profile");
                setAddresses(profileData.addresses || []);
            } catch (error) {
                console.log("Error fetching profile details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [user, router]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateLoading(true);
        setUpdateMessage("");
        try {
            const { data } = await api.put("/users/profile", { name, email, phone });
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

    // Address Actions
    const handleAddAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setNewAddress((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setDetectingLocation(true);
        setLocationMessage("");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                    );
                    const data = await res.json();
                    if (data && data.address) {
                        const addr = data.address;
                        const city = addr.city || addr.town || addr.village || addr.suburb || "";
                        const state = addr.state || "";
                        const pincode = addr.postcode || "";
                        
                        const road = addr.road || addr.suburb || addr.neighbourhood || "";
                        const district = addr.city_district || addr.subdistrict || "";
                        const streetDetails = road && district ? `${road}, ${district}` : (road || district);

                        setNewAddress((prev) => ({
                            ...prev,
                            street: streetDetails,
                            city,
                            state,
                            pincode
                        }));

                        setLocationMessage(
                            "📍 Location set! Please add flat/house no., floor, or landmark to the street field."
                        );
                    }
                } catch (err) {
                    alert("Failed to reverse geocode location");
                } finally {
                    setDetectingLocation(false);
                }
            },
            (err) => {
                alert("Failed to retrieve location details.");
                setDetectingLocation(false);
            }
        );
    };

    const handleAddAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddressError("");
        setLoadingAddresses(true);

        // Validation
        if (!newAddress.name.trim() || !newAddress.phone.trim() || !newAddress.email.trim() || 
            !newAddress.street.trim() || !newAddress.city.trim() || !newAddress.state.trim() || !newAddress.pincode.trim()) {
            setAddressError("Please fill out all required fields.");
            setLoadingAddresses(false);
            return;
        }

        if (!/^[6-9]\d{9}$/.test(newAddress.phone.trim())) {
            setAddressError("Enter a valid 10-digit Indian phone number.");
            setLoadingAddresses(false);
            return;
        }

        if (!/^\d{6}$/.test(newAddress.pincode.trim())) {
            setAddressError("Enter a valid 6-digit pincode.");
            setLoadingAddresses(false);
            return;
        }

        try {
            const { data } = await api.post("/users/addresses", newAddress);
            setAddresses(data);
            setShowAddAddressForm(false);
            setNewAddress({
                name: user?.name || "",
                phone: user?.phone || "",
                email: user?.email || "",
                street: "",
                city: "",
                state: "",
                pincode: "",
                country: "India",
                isDefault: false
            });
            setLocationMessage("");
        } catch (err: any) {
            setAddressError(err.response?.data?.message || "Failed to add address");
        } finally {
            setLoadingAddresses(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return;
        try {
            const { data } = await api.delete(`/users/addresses/${id}`);
            setAddresses(data);
        } catch (err) {
            alert("Failed to delete address");
        }
    };

    const handleSetDefaultAddress = async (id: string) => {
        try {
            const { data } = await api.put(`/users/addresses/${id}/default`);
            setAddresses(data);
        } catch (err) {
            alert("Failed to set default address");
        }
    };

    if (!user) return null;

    return (
        <div className="bg-cream min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="md:grid md:grid-cols-4 md:gap-8">
                    {/* Sidebar */}
                    <div className="mb-8 md:mb-0">
                        <div className="card-premium p-6 text-center">
                            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-serif mb-4 bg-gradient-to-br from-gold-light/40 to-pink-blush/40 text-gold-dark border-2 border-gold/20 animate-fade-in">
                                {user.name.charAt(0)}
                            </div>

                            {editing ? (
                                <form onSubmit={handleProfileUpdate} className="text-left space-y-3 mt-4 animate-fade-in">
                                    <div><label className="block text-xs text-foreground/60 mb-1">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-elegant text-sm py-2" /></div>
                                    <div><label className="block text-xs text-foreground/60 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-elegant text-sm py-2" /></div>
                                    <div><label className="block text-xs text-foreground/60 mb-1">Phone</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-elegant text-sm py-2" /></div>
                                    <div className="flex gap-2 pt-2">
                                        <Button type="submit" size="sm" disabled={updateLoading}>{updateLoading ? "Saving..." : "Save"}</Button>
                                        <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="animate-fade-in">
                                    <h2 className="text-xl font-serif text-foreground mb-1">{user.name}</h2>
                                    <p className="text-sm text-foreground/60 mb-1">{user.email}</p>
                                    {user.phone && <p className="text-xs text-foreground/40 mb-4">{user.phone}</p>}
                                    <Button variant="outline" fullWidth className="mb-3" onClick={() => setEditing(true)}>Edit Profile</Button>
                                </div>
                            )}

                            {updateMessage && <p className="text-green-600 text-xs mt-2">{updateMessage}</p>}
                            {passwordMessage && <p className="text-green-600 text-xs mt-2">{passwordMessage}</p>}

                            <div className="mt-4 space-y-2">
                                <Button variant="outline" fullWidth size="sm" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                                    {showPasswordForm ? "Cancel" : "Change Password"}
                                </Button>
                                {showPasswordForm && (
                                    <form onSubmit={handlePasswordChange} className="text-left space-y-3 mt-3 animate-fade-in">
                                        {passwordError && <p className="text-red-400 text-xs">{passwordError}</p>}
                                        <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-elegant text-sm py-2" required />
                                        <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-elegant text-sm py-2" required />
                                        <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-elegant text-sm py-2" required />
                                        <Button type="submit" size="sm" fullWidth disabled={passwordLoading}>{passwordLoading ? "Updating..." : "Update Password"}</Button>
                                    </form>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-beige/60 space-y-2">
                                {user.isAdmin && (<Link href="/admin"><Button variant="outline" fullWidth className="mb-2">Admin Dashboard</Button></Link>)}
                                <Button variant="ghost" fullWidth onClick={logout} className="text-red-400 hover:text-red-500">Logout</Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Columns */}
                    <div className="md:col-span-3 space-y-6">
                        {/* Tab Switcher */}
                        <div className="flex border-b border-beige/60">
                            <button
                                onClick={() => setActiveTab("orders")}
                                className={`py-3 px-6 text-sm font-serif border-b-2 transition-all duration-300 ${
                                    activeTab === "orders"
                                        ? "border-gold text-gold font-medium"
                                        : "border-transparent text-foreground/50 hover:text-foreground"
                                }`}
                            >
                                Order History
                            </button>
                            <button
                                onClick={() => setActiveTab("addresses")}
                                className={`py-3 px-6 text-sm font-serif border-b-2 transition-all duration-300 ${
                                    activeTab === "addresses"
                                        ? "border-gold text-gold font-medium"
                                        : "border-transparent text-foreground/50 hover:text-foreground"
                                }`}
                            >
                                Saved Addresses
                            </button>
                        </div>

                        {/* Order History Tab */}
                        {activeTab === "orders" && (
                            <div className="card-premium p-6 sm:p-8 animate-fade-in">
                                <h2 className="text-2xl font-serif text-foreground mb-6">Order History</h2>
                                {loading ? (
                                    <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-beige/40 rounded-lg animate-pulse" />)}</div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-3xl text-gold/20 mb-4">✦</div>
                                        <p className="text-foreground/50 mb-4 italic">You haven&apos;t placed any orders yet.</p>
                                        <Link href="/shop"><Button variant="outline">Start Shopping</Button></Link>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-beige/60">
                                                    <th className="py-3 px-4 text-xs font-semibold text-gold uppercase tracking-[0.15em]">ID</th>
                                                    <th className="py-3 px-4 text-xs font-semibold text-gold uppercase tracking-[0.15em]">Date</th>
                                                    <th className="py-3 px-4 text-xs font-semibold text-gold uppercase tracking-[0.15em]">Total</th>
                                                    <th className="py-3 px-4 text-xs font-semibold text-gold uppercase tracking-[0.15em]">Paid</th>
                                                    <th className="py-3 px-4 text-xs font-semibold text-gold uppercase tracking-[0.15em]">Status</th>
                                                    <th className="py-3 px-4 text-xs font-semibold text-gold uppercase tracking-[0.15em]"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map((order: any) => (
                                                    <tr key={order._id} className="border-b border-beige/40 last:border-b-0 hover:bg-gold/[0.02] transition-colors">
                                                        <td className="py-4 px-4 text-sm font-medium text-foreground">{order._id.substring(0, 8)}...</td>
                                                        <td className="py-4 px-4 text-sm text-foreground/70">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                        <td className="py-4 px-4 text-sm text-foreground font-medium">₹{order.totalPrice}</td>
                                                        <td className="py-4 px-4 text-sm">{order.isPaid ? <span className="text-sage font-medium">Yes</span> : <span className="text-red-400">No</span>}</td>
                                                        <td className="py-4 px-4 text-sm capitalize">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'delivered' ? 'bg-sage/10 text-sage' : order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-400' : 'bg-gold/5 text-gold'}`}>
                                                                {order.orderStatus}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-sm text-right">
                                                            <Link href={`/order/${order._id}`}><Button variant="outline" size="sm">Details</Button></Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Saved Addresses Tab */}
                        {activeTab === "addresses" && (
                            <div className="card-premium p-6 sm:p-8 animate-fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-serif text-foreground">Saved Addresses</h2>
                                    {!showAddAddressForm && (
                                        <Button size="sm" onClick={() => setShowAddAddressForm(true)}>Add New Address</Button>
                                    )}
                                </div>

                                {showAddAddressForm ? (
                                    <form onSubmit={handleAddAddressSubmit} className="space-y-4 border border-beige p-5 rounded-2xl bg-cream-light/30 mb-6 animate-fade-in">
                                        <div className="flex items-center justify-between border-b border-beige/60 pb-3 mb-4">
                                            <h3 className="font-serif text-lg font-medium text-foreground">New Shipping Address</h3>
                                            <button
                                                type="button"
                                                onClick={handleUseCurrentLocation}
                                                disabled={detectingLocation}
                                                className="text-xs bg-gold/10 hover:bg-gold/20 text-gold-dark px-3 py-1.5 rounded-full border border-gold/20 flex gap-1 items-center font-medium uppercase tracking-wider"
                                            >
                                                {detectingLocation ? "Locating..." : "📍 Use Location"}
                                            </button>
                                        </div>

                                        {addressError && <p className="text-red-400 text-xs">{addressError}</p>}
                                        {locationMessage && <p className="text-gold-dark text-xs p-3 rounded-lg border border-gold/20 bg-gold/[0.02]">ℹ️ {locationMessage}</p>}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs mb-1 text-foreground/70">Recipient Full Name *</label>
                                                <input type="text" name="name" value={newAddress.name} onChange={handleAddAddressChange} placeholder="e.g. John Doe" className="input-elegant text-sm py-2" />
                                            </div>
                                            <div>
                                                <label className="block text-xs mb-1 text-foreground/70">Recipient Phone Number *</label>
                                                <input type="text" name="phone" value={newAddress.phone} onChange={handleAddAddressChange} placeholder="10-digit number" className="input-elegant text-sm py-2" />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs mb-1 text-foreground/70">Contact Email *</label>
                                                <input type="email" name="email" value={newAddress.email} onChange={handleAddAddressChange} placeholder="email@address.com" className="input-elegant text-sm py-2" />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs mb-1 text-foreground/70">Street Address *</label>
                                                <input type="text" name="street" value={newAddress.street} onChange={handleAddAddressChange} placeholder="House / Flat No, Floor, Landmark, Locality" className="input-elegant text-sm py-2" />
                                            </div>
                                            <div>
                                                <label className="block text-xs mb-1 text-foreground/70">City *</label>
                                                <input type="text" name="city" value={newAddress.city} onChange={handleAddAddressChange} className="input-elegant text-sm py-2" />
                                            </div>
                                            <div>
                                                <label className="block text-xs mb-1 text-foreground/70">State *</label>
                                                <input type="text" name="state" value={newAddress.state} onChange={handleAddAddressChange} className="input-elegant text-sm py-2" />
                                            </div>
                                            <div>
                                                <label className="block text-xs mb-1 text-foreground/70">Pincode *</label>
                                                <input type="text" name="pincode" value={newAddress.pincode} onChange={handleAddAddressChange} placeholder="6-digit pincode" className="input-elegant text-sm py-2" />
                                            </div>
                                            <div>
                                                <label className="block text-xs mb-1 text-foreground/70">Country</label>
                                                <input type="text" name="country" value="India" readOnly className="input-elegant text-sm py-2 bg-beige/20 cursor-not-allowed" />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <input type="checkbox" id="isDefault" name="isDefault" checked={newAddress.isDefault} onChange={handleAddAddressChange} className="text-gold focus:ring-gold border-beige rounded" />
                                            <label htmlFor="isDefault" className="text-xs text-foreground/80 cursor-pointer">Make this my default shipping address</label>
                                        </div>

                                        <div className="flex gap-2 pt-2 border-t border-beige/60">
                                            <Button type="submit" disabled={loadingAddresses}>{loadingAddresses ? "Adding..." : "Save Address"}</Button>
                                            <Button variant="ghost" onClick={() => { setShowAddAddressForm(false); setLocationMessage(""); setAddressError(""); }}>Cancel</Button>
                                        </div>
                                    </form>
                                ) : null}

                                {addresses.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-beige/60 rounded-2xl">
                                        <p className="text-foreground/50 mb-3 italic">You don&apos;t have any saved addresses yet.</p>
                                        {!showAddAddressForm && (
                                            <Button variant="outline" size="sm" onClick={() => setShowAddAddressForm(true)}>Add One Now</Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {addresses.map((addr: any) => (
                                            <div key={addr._id} className="border border-beige p-5 rounded-2xl relative bg-beige/[0.04] flex flex-col justify-between group hover:border-gold transition-all duration-300 animate-fade-in">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2 pr-16">
                                                        <h4 className="font-semibold text-foreground text-sm">{addr.name}</h4>
                                                        {addr.isDefault && (
                                                            <span className="bg-gold/10 text-gold-dark text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-gold/10">Default</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-foreground/70">{addr.phone}</p>
                                                    <p className="text-xs text-foreground/50 truncate mb-3">{addr.email}</p>
                                                    <p className="text-xs text-foreground/80 leading-relaxed border-t border-beige/30 pt-2">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                                </div>

                                                <div className="flex items-center gap-4 mt-5 pt-3 border-t border-beige/30 text-xs">
                                                    {!addr.isDefault && (
                                                        <button onClick={() => handleSetDefaultAddress(addr._id)} className="text-gold hover:text-gold-dark font-medium underline transition-all">Set Default</button>
                                                    )}
                                                    <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-400 hover:text-red-500 font-medium underline transition-all ml-auto">Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
