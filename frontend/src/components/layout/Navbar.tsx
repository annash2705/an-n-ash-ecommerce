"use client";

import Link from "next/link";
import { ShoppingCart, User, Menu, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { cartItems } = useCart();
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Track scroll for glassmorphism effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header className={`sticky top-0 z-50 transition-all duration-500 ${
                scrolled 
                    ? 'bg-cream/80 backdrop-blur-xl shadow-[0_1px_20px_rgba(196,154,60,0.08)]' 
                    : 'bg-cream'
            }`}>
                {/* Decorative top gold line */}
                <div className="h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center h-full py-1 overflow-visible">
                            <Link href="/" className="flex items-center h-full group">
                                <img 
                                    src="/logo-gold.png" 
                                    alt="An.n.Ash Logo" 
                                    className="h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-105" 
                                />
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center space-x-10">
                            {[
                                { href: '/', label: 'Home' },
                                { href: '/shop', label: 'Shop' },
                                { href: '/custom-orders', label: 'Custom Orders' },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`nav-link-fancy text-sm uppercase tracking-[0.2em] font-medium transition-colors duration-300 ${
                                        pathname === link.href 
                                            ? 'text-gold' 
                                            : 'text-foreground hover:text-gold'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Icons */}
                        <div className="hidden md:flex items-center space-x-6">
                            <Link href="/cart" className="text-foreground hover:text-gold transition-colors duration-300 relative group">
                                <ShoppingCart className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2.5 bg-gradient-to-br from-pink-soft to-pink-blush text-foreground text-[10px] rounded-full h-[18px] w-[18px] flex items-center justify-center font-bold shadow-sm">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <div className="relative group py-2">
                                    <button className="flex items-center text-foreground hover:text-gold transition-colors duration-300">
                                        <User className="w-5 h-5" />
                                    </button>
                                    <div className="absolute right-0 top-full pt-2 w-52 hidden group-hover:block z-50">
                                        <div className="bg-ivory/95 backdrop-blur-md rounded-xl shadow-lg py-2 border border-gold-light/40 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                                            <div className="px-4 py-2 border-b border-beige">
                                                <p className="text-xs text-gold uppercase tracking-wider">Welcome back</p>
                                                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                                            </div>
                                            <Link href="/profile" className="block px-4 py-2.5 text-sm text-foreground hover:bg-pink-blush/40 hover:text-gold transition-all duration-200">Profile</Link>
                                            {user.isAdmin && (
                                                <Link href="/admin" className="block px-4 py-2.5 text-sm text-foreground hover:bg-pink-blush/40 hover:text-gold transition-all duration-200">Admin Dashboard</Link>
                                            )}
                                            <button onClick={logout} className="block w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-pink-blush/40 hover:text-gold transition-all duration-200">Logout</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link href="/login" className="text-foreground hover:text-gold transition-colors duration-300 group">
                                    <User className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                                </Link>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden space-x-4">
                            <Link href="/cart" className="text-foreground relative">
                                <ShoppingCart className="w-6 h-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-gradient-to-br from-pink-soft to-pink-blush text-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-foreground hover:text-gold focus:outline-none transition-colors"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
                    isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                    <div className="bg-ivory/95 backdrop-blur-md border-t border-gold-light/30">
                        <div className="px-4 pt-4 pb-6 space-y-1">
                            {[
                                { href: '/', label: 'Home' },
                                { href: '/shop', label: 'Shop All' },
                                { href: '/custom-orders', label: 'Custom Orders' },
                            ].map((link, i) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                                        pathname === link.href
                                            ? 'text-gold bg-pink-blush/30'
                                            : 'text-foreground hover:text-gold hover:bg-pink-blush/20'
                                    }`}
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div className="my-3 gold-divider">
                                <div className="gold-divider-gem" />
                            </div>

                            {!user ? (
                                <Link href="/login" className="block px-4 py-3 rounded-lg text-base font-medium text-foreground hover:text-gold hover:bg-pink-blush/20 transition-all duration-300">
                                    Login / Register
                                </Link>
                            ) : (
                                <div className="px-4 py-2 space-y-1">
                                    <p className="font-semibold text-foreground">{user.name}</p>
                                    <Link href="/profile" className="block py-2 text-foreground hover:text-gold transition-colors">Profile</Link>
                                    {user.isAdmin && (
                                        <Link href="/admin" className="block py-2 text-foreground hover:text-gold transition-colors">Admin Dashboard</Link>
                                    )}
                                    <button onClick={logout} className="block py-2 w-full text-left text-foreground hover:text-gold transition-colors">Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};
