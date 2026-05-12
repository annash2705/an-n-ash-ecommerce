import Link from "next/link";
import { Instagram, Mail } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="footer-flourish border-t border-gold-light/30 pt-16 pb-8">
            {/* Decorative flourish at top */}
            <div className="max-w-xs mx-auto mb-12">
                <div className="gold-divider">
                    <div className="gold-divider-gem" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1 text-center md:text-left">
                        <img src="/brand-hero.jpg" alt="An.n.Ash" className="w-28 h-28 object-contain mx-auto md:mx-0 mb-4 rounded-xl opacity-90" />
                        <p className="text-foreground text-sm leading-relaxed mb-5 max-w-xs mx-auto md:mx-0">
                            Whimsical, ethereal, and artistic handmade wired jewelry pieces — crafted with magic for your unique style.
                        </p>
                        <div className="flex space-x-4 justify-center md:justify-start">
                            <a href="https://www.instagram.com/an.n.ash" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-all duration-300 group">
                                <Instagram className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                            </a>
                            <a href="mailto:anandashjewelry@gmail.com" className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-all duration-300 group">
                                <Mail className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-serif text-base text-gold uppercase tracking-[0.2em] mb-5">Shop</h3>
                        <ul className="space-y-3">
                            {[
                                { href: '/shop?category=Necklaces', label: 'Necklaces' },
                                { href: '/shop?category=Earrings', label: 'Earrings' },
                                { href: '/shop?category=Arm Cuffs', label: 'Arm Cuffs' },
                                { href: '/shop?category=Hair Accessories', label: 'Hair Accessories' },
                                { href: '/shop?category=Rings', label: 'Rings' },
                                { href: '/custom-orders', label: 'Custom Orders' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-foreground hover:text-gold transition-colors duration-300 hover:tracking-wider">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h3 className="font-serif text-base text-gold uppercase tracking-[0.2em] mb-5">Support</h3>
                        <ul className="space-y-3">
                            {[
                                { href: '/contact', label: 'Contact Us' },
                                { href: '/faq', label: 'FAQ' },
                                { href: '/jewelry-care', label: 'Jewelry Care' },
                                { href: '/terms', label: 'Terms & Conditions' },
                                { href: '/privacy', label: 'Privacy Policy' },
                                { href: '/refund', label: 'Refund Policy' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-foreground hover:text-gold transition-colors duration-300 hover:tracking-wider">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Stay Connected */}
                    <div>
                        <h3 className="font-serif text-base text-gold uppercase tracking-[0.2em] mb-5">Stay Connected</h3>
                        <p className="text-sm text-foreground mb-5 leading-relaxed">Follow us on Instagram for new drops, styling tips, and behind-the-scenes magic.</p>
                        <a
                            href="https://www.instagram.com/an.n.ash"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-2 bg-gradient-to-r from-gold to-gold-dark text-white px-6 py-2.5 text-sm uppercase tracking-[0.15em] hover:shadow-[0_4px_20px_rgba(196,154,60,0.3)] transition-all duration-500 rounded-full"
                        >
                            <Instagram className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                            Follow on Instagram
                        </a>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-14 pt-8 border-t border-gold-light/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-foreground/60 tracking-wider">
                        &copy; {new Date().getFullYear()} An.n.Ash — Wired Jewellery by San. All rights reserved.
                    </p>
                    <p className="text-xs text-foreground/40">
                        Handcrafted with ✦ in India
                    </p>
                </div>
            </div>
        </footer>
    );
};
