"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";
import Script from "next/script";

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { cartItems, cartTotal, clearCart } = useCart();

    const [address, setAddress] = useState({
        name: "",
        phone: "",
        email: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
    });

    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    const [detectingLocation, setDetectingLocation] = useState(false);
    const [locationMessage, setLocationMessage] = useState("");

    const [paymentMethod, setPaymentMethod] = useState("Razorpay");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Protect route & load saved addresses
    useEffect(() => {
        if (!user) {
            router.push("/login?redirect=checkout");
            return;
        }

        const fetchSavedAddresses = async () => {
            try {
                const { data } = await api.get("/users/profile");
                if (data.addresses && data.addresses.length > 0) {
                    setSavedAddresses(data.addresses);
                    
                    // Select default address if it exists
                    const defaultAddr = data.addresses.find((addr: any) => addr.isDefault);
                    if (defaultAddr) {
                        selectAddressHandler(defaultAddr);
                    }
                }
            } catch (err) {
                console.error("Failed to load saved addresses", err);
            } finally {
                setLoadingAddresses(false);
            }
        };

        fetchSavedAddresses();
    }, [user, router]);

    const selectAddressHandler = (addr: any) => {
        setSelectedAddressId(addr._id);
        setAddress({
            name: addr.name || "",
            phone: addr.phone || "",
            email: addr.email || "",
            street: addr.street || "",
            city: addr.city || "",
            state: addr.state || "",
            pincode: addr.pincode || "",
            country: addr.country || "India",
        });
        // Clear errors
        setErrors({});
        setLocationMessage("");
    };

    const clearSelectedAddress = () => {
        setSelectedAddressId(null);
        setAddress({
            name: user?.name || "",
            phone: user?.phone || "",
            email: user?.email || "",
            street: "",
            city: "",
            state: "",
            pincode: "",
            country: "India",
        });
        setLocationMessage("");
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
                        
                        // Extract street/neighborhood
                        const road = addr.road || addr.suburb || addr.neighbourhood || "";
                        const district = addr.city_district || addr.subdistrict || "";
                        const streetDetails = road && district ? `${road}, ${district}` : (road || district);

                        setAddress((prev) => ({
                            ...prev,
                            street: streetDetails,
                            city,
                            state,
                            pincode,
                        }));
                        
                        // Clear location errors
                        setErrors((prev) => ({
                            ...prev,
                            street: "",
                            city: "",
                            state: "",
                            pincode: "",
                        }));

                        setLocationMessage(
                            "📍 Location set! Please add your flat/house no., building name, floor, or landmark to the street address below."
                        );
                    } else {
                        alert("Could not detect location. Please type manually.");
                    }
                } catch (err) {
                    console.error(err);
                    alert("Error fetching location details. Please type manually.");
                } finally {
                    setDetectingLocation(false);
                }
            },
            (error) => {
                let msg = "Failed to detect location.";
                if (error.code === error.PERMISSION_DENIED) {
                    msg = "Location permission denied. Please type your address manually.";
                }
                alert(msg);
                setDetectingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!address.name.trim()) newErrors.name = "Full name is required";
        if (!address.phone.trim()) newErrors.phone = "Phone number is required";
        else if (!/^[6-9]\d{9}$/.test(address.phone.trim())) newErrors.phone = "Enter a valid 10-digit Indian phone number";
        if (!address.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) newErrors.email = "Enter a valid email address";
        if (!address.street.trim()) newErrors.street = "Street address is required";
        if (!address.city.trim()) newErrors.city = "City is required";
        if (!address.state.trim()) newErrors.state = "State is required";
        if (!address.pincode.trim()) newErrors.pincode = "Pincode is required";
        else if (!/^\d{6}$/.test(address.pincode.trim())) newErrors.pincode = "Enter a valid 6-digit pincode";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const placeOrderHandler = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const orderData = { 
                orderItems: cartItems, 
                shippingAddress: address, 
                paymentMethod, 
                itemsPrice: cartTotal, 
                shippingPrice: cartTotal > 0 ? 100 : 0, 
                totalPrice: cartTotal + (cartTotal > 0 ? 100 : 0) 
            };
            const { data } = await api.post("/orders", orderData);
            if (paymentMethod === "Razorpay") {
                const { data: clientId } = await api.get("/config/razorpay");
                if (!clientId || clientId.includes("your_razorpay")) { 
                    alert("Razorpay integration is incomplete."); 
                    setLoading(false); 
                    return; 
                }
                const { data: rzpOrder } = await api.post(`/orders/${data._id}/pay`);
                const options = {
                    key: clientId, 
                    amount: rzpOrder.amount, 
                    currency: rzpOrder.currency, 
                    name: "An.n.Ash", 
                    description: "Order Payment", 
                    order_id: rzpOrder.id,
                    handler: async function (response: any) {
                        try { 
                            await api.post(`/orders/${data._id}/verify`, response); 
                            clearCart(); 
                            router.push(`/order/${data._id}`); 
                        }
                        catch (err) { 
                            alert("Payment verification failed."); 
                        }
                    },
                    prefill: { name: address.name, email: address.email, contact: address.phone },
                    theme: { color: "#C49A3C" }
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.on("payment.failed", function (response: any) { 
                    alert("Payment Failed: " + response.error.description); 
                });
                rzp.open();
            } else { 
                clearCart(); 
                router.push(`/order/${data._id}`); 
            }
        } catch (error: any) { 
            alert(error.response?.data?.message || "Error placing order."); 
        }
        finally { 
            setLoading(false); 
        }
    };

    if (!user) return null;

    const inputClass = (field: string) => `input-elegant ${errors[field] ? '!border-red-300 !focus:border-red-400' : ''}`;

    return (
        <div className="bg-cream min-h-screen py-16">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-gold tracking-[0.3em] text-xs uppercase mb-3">✦</p>
                    <h1 className="text-4xl font-serif text-foreground">Checkout</h1>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                    <div className="lg:col-span-8 space-y-8">
                        {/* Saved Addresses Section */}
                        {!loadingAddresses && savedAddresses.length > 0 && (
                            <div className="card-premium p-6 sm:p-8">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-2xl font-serif">Saved Addresses</h2>
                                    {selectedAddressId && (
                                        <button 
                                            onClick={clearSelectedAddress}
                                            className="text-xs text-gold hover:text-gold-dark font-medium underline uppercase tracking-wider"
                                        >
                                            Deliver to a New Address
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {savedAddresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            onClick={() => selectAddressHandler(addr)}
                                            className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all duration-300 relative ${
                                                selectedAddressId === addr._id
                                                    ? "border-gold bg-gold/[0.03]"
                                                    : "border-beige hover:border-gold-light"
                                            }`}
                                        >
                                            {addr.isDefault && (
                                                <span className="absolute top-3 right-3 bg-gold/10 text-gold-dark text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-gold/20">
                                                    Default
                                                </span>
                                            )}
                                            <p className="font-semibold text-foreground text-sm pr-12">{addr.name}</p>
                                            <p className="text-xs text-foreground/80 mt-1">{addr.phone}</p>
                                            <p className="text-xs text-foreground/60 truncate">{addr.email}</p>
                                            <p className="text-xs text-foreground/75 mt-2 line-clamp-2">
                                                {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Shipping Details */}
                        <div className="card-premium p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <h2 className="text-2xl font-serif">
                                    {selectedAddressId ? "Selected Shipping Address" : "Shipping Information"}
                                </h2>
                                {!selectedAddressId && (
                                    <button
                                        type="button"
                                        onClick={handleUseCurrentLocation}
                                        disabled={detectingLocation}
                                        className="flex items-center justify-center gap-2 bg-gold/10 hover:bg-gold/20 text-gold-dark font-medium text-xs uppercase tracking-wider py-2 px-4 rounded-full border border-gold/30 transition-all active:scale-[0.98]"
                                    >
                                        {detectingLocation ? (
                                            <>
                                                <span className="w-3.5 h-3.5 border-2 border-gold-dark border-t-transparent rounded-full animate-spin"></span>
                                                Detecting...
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-sm">📍</span>
                                                Use Current Location
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {locationMessage && (
                                <div className="mb-6 p-4 rounded-xl border border-gold/30 bg-gold/[0.03] text-gold-dark text-xs flex gap-2 items-start animate-fade-in">
                                    <span className="text-sm mt-0.5">ℹ️</span>
                                    <p>{locationMessage}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1.5 text-foreground/80">Full Name *</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={address.name}
                                        onChange={handleChange} 
                                        disabled={!!selectedAddressId}
                                        className={inputClass("name")} 
                                    />
                                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm mb-1.5 text-foreground/80">Phone Number *</label>
                                    <input 
                                        type="text" 
                                        name="phone" 
                                        value={address.phone}
                                        onChange={handleChange} 
                                        placeholder="10-digit number" 
                                        disabled={!!selectedAddressId}
                                        className={inputClass("phone")} 
                                    />
                                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm mb-1.5 text-foreground/80">Email *</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={address.email}
                                        onChange={handleChange} 
                                        disabled={!!selectedAddressId}
                                        className={inputClass("email")} 
                                    />
                                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm mb-1.5 text-foreground/80">Street Address *</label>
                                    <input 
                                        type="text" 
                                        name="street" 
                                        value={address.street}
                                        onChange={handleChange} 
                                        disabled={!!selectedAddressId}
                                        placeholder={locationMessage ? "Add house/flat/landmark details here..." : "House No, Street, Area..."}
                                        className={inputClass("street")} 
                                    />
                                    {errors.street && <p className="text-red-400 text-xs mt-1">{errors.street}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm mb-1.5 text-foreground/80">City *</label>
                                    <input 
                                        type="text" 
                                        name="city" 
                                        value={address.city}
                                        onChange={handleChange} 
                                        disabled={!!selectedAddressId}
                                        className={inputClass("city")} 
                                    />
                                    {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm mb-1.5 text-foreground/80">State *</label>
                                    <input 
                                        type="text" 
                                        name="state" 
                                        value={address.state}
                                        onChange={handleChange} 
                                        disabled={!!selectedAddressId}
                                        className={inputClass("state")} 
                                    />
                                    {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm mb-1.5 text-foreground/80">Pincode *</label>
                                    <input 
                                        type="text" 
                                        name="pincode" 
                                        value={address.pincode}
                                        onChange={handleChange} 
                                        placeholder="6-digit pincode" 
                                        disabled={!!selectedAddressId}
                                        className={inputClass("pincode")} 
                                    />
                                    {errors.pincode && <p className="text-red-400 text-xs mt-1">{errors.pincode}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm mb-1.5 text-foreground/80">Country</label>
                                    <input type="text" name="country" value="India" readOnly className="input-elegant bg-beige/30 cursor-not-allowed" />
                                </div>
                            </div>
                        </div>

                        {/* Payment Selection */}
                        <div className="card-premium p-6 sm:p-8">
                            <h2 className="text-2xl font-serif mb-5">Payment Method</h2>
                            <div className="space-y-4">
                                <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-300 ${paymentMethod === 'Razorpay' ? 'border-gold bg-gold/5' : 'border-beige hover:border-gold-light'}`}>
                                    <input type="radio" name="paymentMethod" value="Razorpay" checked={paymentMethod === "Razorpay"} onChange={(e) => setPaymentMethod(e.target.value)} className="text-gold focus:ring-gold" />
                                    <span className="ml-3 text-foreground font-medium">Razorpay (Cards, UPI, NetBanking)</span>
                                </label>
                                <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-300 ${paymentMethod === 'Cash on Delivery' ? 'border-gold bg-gold/5' : 'border-beige hover:border-gold-light'}`}>
                                    <input type="radio" name="paymentMethod" value="Cash on Delivery" checked={paymentMethod === "Cash on Delivery"} onChange={(e) => setPaymentMethod(e.target.value)} className="text-gold focus:ring-gold" />
                                    <span className="ml-3 text-foreground font-medium">Cash on Delivery</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Order Side Review */}
                    <div className="mt-8 lg:mt-0 lg:col-span-4 self-start sticky top-28">
                        <div className="card-premium p-6 sm:p-8 animate-pulse-glow">
                            <h2 className="text-2xl font-serif mb-6">Review Order</h2>
                            <ul className="divide-y divide-beige/60 border-b border-beige/60 mb-6">
                                {cartItems.map((item) => (
                                    <li key={item.product} className="py-3 flex items-center justify-between text-sm">
                                        <span className="text-foreground/70 truncate pr-4">{item.qty} x {item.name}</span>
                                        <span className="font-medium text-foreground">₹{item.price * item.qty}</span>
                                    </li>
                                ))}
                            </ul>
                            <dl className="space-y-4 text-sm text-foreground/80">
                                <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-medium text-foreground">₹{cartTotal}</dd></div>
                                <div className="flex justify-between border-t border-beige/60 pt-4"><dt>Shipping</dt><dd className="font-medium text-foreground">₹{cartTotal > 0 ? 100 : 0}</dd></div>
                                <div className="flex justify-between border-t border-beige/60 pt-4 text-lg font-medium text-foreground"><dt>Total</dt><dd className="text-gold font-semibold text-xl">₹{cartTotal > 0 ? cartTotal + 100 : 0}</dd></div>
                            </dl>
                            <div className="mt-8">
                                <Button fullWidth size="lg" onClick={placeOrderHandler} disabled={cartItems.length === 0 || loading}>{loading ? "Processing..." : "Place Order"}</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
