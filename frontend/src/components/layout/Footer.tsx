import Link from "next/link";
import { Instagram, Mail, MapPin } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-cream border-t border-beige pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <h2 className="font-serif text-2xl text-gold-dark mb-4">An.n.Ash</h2>
                        <p className="text-foreground text-sm leading-relaxed mb-4">
                            Whimsical, ethereal, and artistic handmade jewelry pieces tailored for your unique style.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-foreground hover:text-gold transition">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-foreground hover:text-gold transition">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-serif text-lg text-foreground uppercase tracking-wider mb-4">Shop</h3>
                        <ul className="space-y-2">
                            <li><Link href="/shop?category=Necklaces" className="text-sm text-foreground hover:text-gold transition">Necklaces</Link></li>
                            <li><Link href="/shop?category=Earrings" className="text-sm text-foreground hover:text-gold transition">Earrings</Link></li>
                            <li><Link href="/shop?category=Arm Cuffs" className="text-sm text-foreground hover:text-gold transition">Arm Cuffs</Link></li>
                            <li><Link href="/shop?category=Rings" className="text-sm text-foreground hover:text-gold transition">Rings</Link></li>
                            <li><Link href="/custom-orders" className="text-sm text-foreground hover:text-gold transition">Custom Orders</Link></li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h3 className="font-serif text-lg text-foreground uppercase tracking-wider mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li><Link href="/contact" className="text-sm text-foreground hover:text-gold transition">Contact Us</Link></li>
                            <li><Link href="/faq" className="text-sm text-foreground hover:text-gold transition">FAQ</Link></li>
                            <li><Link href="/jewelry-care" className="text-sm text-foreground hover:text-gold transition">Jewelry Care</Link></li>
                            <li><Link href="/terms" className="text-sm text-foreground hover:text-gold transition">Terms & Conditions</Link></li>
                            <li><Link href="/privacy" className="text-sm text-foreground hover:text-gold transition">Privacy Policy</Link></li>
                            <li><Link href="/refund" className="text-sm text-foreground hover:text-gold transition">Refund Policy</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-serif text-lg text-foreground uppercase tracking-wider mb-4">Stay Connected</h3>
                        <p className="text-sm text-foreground mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
                        <form className="flex flex-col space-y-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-4 py-2 border border-beige bg-white focus:outline-none focus:border-gold rounded-sm text-sm"
                            />
                            <button
                                type="submit"
                                className="bg-gold text-white px-4 py-2 text-sm uppercase tracking-widest hover:bg-gold-dark transition rounded-sm"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-beige text-center">
                    <p className="text-sm text-foreground">
                        &copy; {new Date().getFullYear()} An.n.Ash. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
