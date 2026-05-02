"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const { cartItems, addToCart, removeFromCart, cartTotal } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const checkoutHandler = () => {
        if (user) {
            router.push("/checkout");
        } else {
            router.push("/login?redirect=checkout");
        }
    };

    return (
        <div className="bg-cream min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif text-foreground mb-10 text-center">Shopping Bag</h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-beige rounded-xl shadow-sm">
                        <p className="text-lg text-foreground mb-6">Your magic bag is empty.</p>
                        <Link href="/shop">
                            <Button>Explore Collection</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">

                        {/* Cart Items */}
                        <div className="lg:col-span-8">
                            <ul className="divide-y divide-beige border-t border-b border-beige">
                                {cartItems.map((item) => {
                                    const maxQty = (item as any).countInStock || 10;
                                    return (
                                        <li key={item.product} className="py-6 flex sm:py-10">
                                            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-md overflow-hidden border border-beige">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover object-center"
                                                />
                                            </div>

                                            <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                                                <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                                    <div>
                                                        <div className="flex justify-between">
                                                            <h3 className="text-lg font-serif">
                                                                <Link href={`/product/${item.product}`} className="text-foreground hover:text-gold transition">
                                                                    {item.name}
                                                                </Link>
                                                            </h3>
                                                        </div>
                                                        <p className="mt-1 text-sm font-medium text-foreground">₹{item.price}</p>
                                                    </div>

                                                    <div className="mt-4 sm:mt-0 sm:pr-9">
                                                        <label htmlFor={`quantity-${item.product}`} className="sr-only">
                                                            Quantity, {item.name}
                                                        </label>
                                                        <select
                                                            id={`quantity-${item.product}`}
                                                            name={`quantity-${item.product}`}
                                                            value={item.qty}
                                                            onChange={(e) => addToCart({ ...item, qty: Number(e.target.value) })}
                                                            className="max-w-full rounded-md border border-beige py-1.5 text-base leading-5 font-medium text-foreground text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold sm:text-sm"
                                                        >
                                                            {Array.from({ length: Math.min(maxQty, 10) }, (_, i) => i + 1).map((x) => (
                                                                <option key={x} value={x}>
                                                                    {x}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        <div className="absolute top-0 right-0 sm:top-auto sm:bottom-0">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFromCart(item.product)}
                                                                className="-m-2 p-2 inline-flex text-foreground hover:text-red-500 transition"
                                                            >
                                                                <span className="sr-only">Remove</span>
                                                                <Trash2 className="h-5 w-5" aria-hidden="true" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="mt-8 flex justify-between">
                                <Link href="/shop" className="text-gold hover:text-gold-dark transition text-sm uppercase tracking-widest font-semibold">
                                    ← Continue Shopping
                                </Link>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="mt-16 bg-white border border-beige rounded-xl px-4 py-6 sm:p-8 lg:mt-0 lg:col-span-4 lg:self-start lg:sticky lg:top-28 shadow-sm">
                            <h2 className="text-xl font-serif text-foreground mb-6">Order Summary</h2>

                            <dl className="space-y-4 text-sm text-foreground">
                                <div className="flex items-center justify-between">
                                    <dt>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</dt>
                                    <dd className="font-medium">₹{cartTotal}</dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-beige pt-4">
                                    <dt className="flex items-center">
                                        <span>Shipping estimate</span>
                                    </dt>
                                    <dd className="font-medium">₹{cartTotal > 0 ? 100 : 0}</dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-beige pt-4 text-lg font-medium">
                                    <dt>Order total</dt>
                                    <dd>₹{cartTotal > 0 ? cartTotal + 100 : 0}</dd>
                                </div>
                            </dl>

                            <div className="mt-8">
                                <Button
                                    fullWidth
                                    size="lg"
                                    disabled={cartItems.length === 0}
                                    onClick={checkoutHandler}
                                >
                                    Checkout
                                </Button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
