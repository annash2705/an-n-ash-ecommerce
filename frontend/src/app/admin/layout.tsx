"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, ClipboardList, Inbox, LogOut, Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!user || !user.isAdmin) {
            router.push("/login");
        }
    }, [user, router]);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    if (!user || !user.isAdmin) return null;

    const navItems = [
        { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
        { label: "Products", href: "/admin/products", icon: <ShoppingBag size={20} /> },
        { label: "Orders", href: "/admin/orders", icon: <ClipboardList size={20} /> },
        { label: "Custom Requests", href: "/admin/custom-requests", icon: <Inbox size={20} /> },
    ];

    const NavContent = () => (
        <>
            <h2 className="text-2xl font-serif text-gold-dark mb-8">Admin Panel</h2>
            <nav className="space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-md transition ${pathname === item.href ? 'bg-pink-soft text-foreground font-medium' : 'text-gray-600 hover:bg-beige hover:text-foreground'}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-md transition text-red-500 hover:bg-red-50 w-full mt-4"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </nav>
        </>
    );

    return (
        <div className="min-h-screen bg-cream flex">
            {/* Desktop Sidebar */}
            <div className="w-64 bg-white border-r border-beige fixed h-full z-10 hidden md:block">
                <div className="p-6">
                    <NavContent />
                </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-beige">
                <div className="flex items-center justify-between px-4 py-3">
                    <h2 className="text-lg font-serif text-gold-dark">Admin Panel</h2>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="text-foreground p-2 hover:bg-beige rounded-md"
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileOpen && (
                    <div className="bg-white border-t border-beige p-4 shadow-lg">
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-md transition ${pathname === item.href ? 'bg-pink-soft text-foreground font-medium' : 'text-gray-600 hover:bg-beige hover:text-foreground'}`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                            <button
                                onClick={logout}
                                className="flex items-center space-x-3 px-4 py-3 rounded-md transition text-red-500 hover:bg-red-50 w-full mt-2"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 p-8 pt-20 md:pt-8">
                {children}
            </div>
        </div>
    );
}
