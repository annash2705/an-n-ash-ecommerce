"use client";

import Link from "next/link";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { cartItems } = useCart();
    const { user, logout } = useAuth();

    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    return (
        <header className="bg-cream sticky top-0 z-50 border-b border-beige">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center h-full py-1 overflow-visible">
                        <Link href="/" className="flex items-center h-full">
                            <img src="/logo-gold.png" alt="An.n.Ash Logo" className="h-16 w-auto object-contain" />
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex space-x-8">
                        <Link href="/" className="text-foreground hover:text-gold transition px-3 py-2 text-sm uppercase tracking-widest">
                            Home
                        </Link>
                        <Link href="/shop" className="text-foreground hover:text-gold transition px-3 py-2 text-sm uppercase tracking-widest">
                            Shop
                        </Link>
                        <Link href="/custom-orders" className="text-foreground hover:text-gold transition px-3 py-2 text-sm uppercase tracking-widest">
                            Custom Orders
                        </Link>
                    </nav>

                    {/* Icons */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/cart" className="text-foreground hover:text-gold transition relative">
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-pink-soft text-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative group py-2">
                                <button className="flex items-center text-foreground hover:text-gold transition">
                                    <User className="w-5 h-5" />
                                </button>
                                <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                                    <div className="bg-white rounded-md shadow-lg py-1 border border-beige">
                                        <Link href="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-beige transition-colors">Profile</Link>
                                        {user.isAdmin && (
                                            <Link href="/admin" className="block px-4 py-2 text-sm text-foreground hover:bg-beige transition-colors">Admin Dashboard</Link>
                                        )}
                                        <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-beige transition-colors">Logout</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" className="text-foreground hover:text-gold transition">
                                <User className="w-5 h-5" />
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden space-x-4">
                        <Link href="/cart" className="text-foreground relative">
                            <ShoppingCart className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-pink-soft text-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-foreground hover:text-gold focus:outline-none"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {
                isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-beige">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-gold hover:bg-beige">
                                Home
                            </Link>
                            <Link href="/shop" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-gold hover:bg-beige">
                                Shop All
                            </Link>
                            <Link href="/custom-orders" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-gold hover:bg-beige">
                                Custom Orders
                            </Link>
                            {!user ? (
                                <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-gold hover:bg-beige">
                                    Login / Register
                                </Link>
                            ) : (
                                <div className="px-3 py-2 space-y-1">
                                    <p className="font-semibold">{user.name}</p>
                                    <Link href="/profile" className="block py-2 text-foreground hover:text-gold">Profile</Link>
                                    {user.isAdmin && (
                                        <Link href="/admin" className="block py-2 text-foreground hover:text-gold">Admin Dashboard</Link>
                                    )}
                                    <button onClick={logout} className="block py-2 w-full text-left text-foreground hover:text-gold">Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </header >
    );
};
