"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

export default function CartPage() {
    const { cartItems, addToCart, removeFromCart, cartTotal } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const checkoutHandler = () => {
        if (user) { router.push("/checkout"); }
        else { router.push("/login?redirect=checkout"); }
    };

    return (
        <div className="bg-cream min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-gold tracking-[0.3em] text-xs uppercase mb-3">✦</p>
                    <h1 className="text-4xl font-serif text-foreground">Shopping Bag</h1>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 card-premium max-w-lg mx-auto">
                        <div className="text-4xl mb-4 text-gold/30">✦</div>
                        <p className="text-lg text-foreground/60 mb-6 font-light italic">Your magic bag is empty.</p>
                        <Link href="/shop"><Button>Explore Collection</Button></Link>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                        <div className="lg:col-span-8">
                            <ul className="divide-y divide-beige/60">
                                {cartItems.map((item) => {
                                    const maxQty = (item as any).countInStock || 10;
                                    return (
                                        <li key={item.product} className="py-8 flex">
                                            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-beige/60 bg-ivory">
                                                <img src={getOptimizedImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="ml-5 flex-1 flex flex-col justify-between">
                                                <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                                    <div>
                                                        <h3 className="text-lg font-serif">
                                                            <Link href={`/product/${item.product}`} className="text-foreground hover:text-gold transition-colors">{item.name}</Link>
                                                        </h3>
                                                        <p className="mt-1 text-sm font-medium text-gold">₹{item.price}</p>
                                                    </div>
                                                    <div className="mt-4 sm:mt-0 sm:pr-9">
                                                        <select
                                                            value={item.qty}
                                                            onChange={(e) => addToCart({ ...item, qty: Number(e.target.value) })}
                                                            className="input-elegant py-1.5 px-3 text-sm max-w-[80px]"
                                                        >
                                                            {Array.from({ length: Math.min(maxQty, 10) }, (_, i) => i + 1).map((x) => (
                                                                <option key={x} value={x}>{x}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute top-0 right-0 sm:top-auto sm:bottom-0">
                                                            <button type="button" onClick={() => removeFromCart(item.product)} className="p-2 text-foreground/40 hover:text-red-400 transition-colors">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="mt-8">
                                <Link href="/shop" className="text-gold hover:text-gold-dark transition-colors text-sm uppercase tracking-[0.15em] font-medium">← Continue Shopping</Link>
                            </div>
                        </div>

                        <div className="mt-12 lg:mt-0 lg:col-span-4 lg:self-start lg:sticky lg:top-28">
                            <div className="card-premium px-6 py-8 animate-pulse-glow">
                                <h2 className="text-xl font-serif text-foreground mb-6">Order Summary</h2>
                                <dl className="space-y-4 text-sm text-foreground/80">
                                    <div className="flex items-center justify-between">
                                        <dt>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</dt>
                                        <dd className="font-medium text-foreground">₹{cartTotal}</dd>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-beige/60 pt-4">
                                        <dt>Shipping estimate</dt>
                                        <dd className="font-medium text-foreground">₹{cartTotal > 0 ? 100 : 0}</dd>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-beige/60 pt-4 text-lg font-medium text-foreground">
                                        <dt>Order total</dt>
                                        <dd className="text-gold font-semibold">₹{cartTotal > 0 ? cartTotal + 100 : 0}</dd>
                                    </div>
                                </dl>
                                <div className="mt-8">
                                    <Button fullWidth size="lg" disabled={cartItems.length === 0} onClick={checkoutHandler}>Checkout</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
