"use client";

import { useState } from "react";
import Link from "next/link";

const customPieces = [
    { src: "/custom-work/piece-1.jpg", title: "Spiral Amethyst Drops", desc: "Silver wire spirals with amethyst & crystal beads" },
    { src: "/custom-work/piece-2.jpg", title: "Emerald & Ruby Chandelier", desc: "Gold wire chandelier earrings with emerald & ruby glass" },
    { src: "/custom-work/piece-3.jpg", title: "Celtic Knot Drops", desc: "Silver wire Celtic knots with jade & pink tourmaline" },
    { src: "/custom-work/piece-4.jpg", title: "Berry Cascade", desc: "Silver wire waves with pink jade & teal crystal beads" },
    { src: "/custom-work/piece-5.jpg", title: "Moonstone Teardrop Chandeliers", desc: "Chain & wire teardrops with rose quartz pendants" },
];

export default function CustomOrdersPage() {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    return (
        <div className="bg-cream min-h-screen watercolor-bg">
            {/* Hero header */}
            <div className="pt-20 pb-12 text-center px-4">
                <p className="text-gold tracking-[0.3em] text-xs uppercase mb-3 animate-fade-in-up">✦ Custom Creations ✦</p>
                <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-5 animate-fade-in-up-delay">Our Handcrafted Work</h1>
                <p className="text-foreground/60 leading-relaxed max-w-xl mx-auto animate-fade-in-up-delay">
                    Every piece is wired by hand with love — here are some of our favourite custom creations brought to life.
                </p>
                <div className="gold-divider mt-8"><div className="gold-divider-gem" /></div>
            </div>

            {/* Gallery grid */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                    {customPieces.map((piece, i) => (
                        <div
                            key={i}
                            className="break-inside-avoid group cursor-pointer"
                            onClick={() => setSelectedImage(i)}
                        >
                            <div className="relative overflow-hidden rounded-2xl border border-gold/10 bg-white/40 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-gold/25 transition-all duration-500">
                                <div className="overflow-hidden">
                                    <img
                                        src={piece.src}
                                        alt={piece.title}
                                        className="w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                </div>
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
                                    <h3 className="text-white font-serif text-lg leading-tight">{piece.title}</h3>
                                    <p className="text-white/70 text-xs mt-1">{piece.desc}</p>
                                </div>
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* DM CTA Section */}
            <div className="py-20 text-center px-4 relative overflow-hidden">
                {/* Background sparkles */}
                <div className="absolute top-[20%] left-[15%] w-1.5 h-1.5 bg-gold/30 rounded-full animate-twinkle" />
                <div className="absolute top-[40%] right-[20%] w-2 h-2 bg-pink-soft/30 rounded-full animate-twinkle" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-[30%] left-[25%] w-1 h-1 bg-gold/20 rounded-full animate-twinkle" style={{ animationDelay: '1.5s' }} />
                <div className="absolute top-[60%] right-[10%] w-1.5 h-1.5 bg-gold/25 rounded-full animate-twinkle" style={{ animationDelay: '0.5s' }} />

                <div className="max-w-2xl mx-auto">
                    <div className="card-premium p-10 sm:p-14 relative">
                        {/* Decorative top flourish */}
                        <div className="text-gold/40 text-3xl mb-6">❋</div>

                        <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
                            Want Something <span className="text-gold italic">Unique</span>?
                        </h2>
                        <p className="text-foreground/60 leading-relaxed mb-8 max-w-md mx-auto">
                            Have a vision for your own custom piece? We&apos;d love to create something magical just for you. Reach out on Instagram to get started!
                        </p>

                        {/* DM CTA */}
                        <div className="space-y-4">
                            <a
                                href="https://www.instagram.com/an.n.ash/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white px-10 py-4 rounded-full text-sm uppercase tracking-[0.15em] font-medium hover:shadow-[0_4px_30px_rgba(131,58,180,0.35)] transition-all duration-500 relative overflow-hidden"
                            >
                                {/* Shimmer sweep */}
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                {/* Instagram icon */}
                                <svg className="w-5 h-5 relative" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                </svg>
                                <span className="relative">DM for Custom Orders</span>
                            </a>

                            <p className="text-foreground/50 text-sm">
                                DM us on Instagram at{" "}
                                <a
                                    href="https://www.instagram.com/an.n.ash/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gold font-medium hover:text-gold-dark transition-colors"
                                >
                                    @an.n.ash
                                </a>
                            </p>
                        </div>

                        {/* Bottom flourish */}
                        <div className="gold-divider mt-10"><div className="gold-divider-gem" /></div>
                    </div>
                </div>
            </div>

            {/* Lightbox modal */}
            {selectedImage !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative max-w-2xl w-full animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white/70 hover:text-white text-sm tracking-wider uppercase transition-colors"
                        >
                            ✕ Close
                        </button>

                        {/* Image */}
                        <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            <img
                                src={customPieces[selectedImage].src}
                                alt={customPieces[selectedImage].title}
                                className="w-full object-contain max-h-[80vh]"
                            />
                        </div>

                        {/* Caption */}
                        <div className="text-center mt-4">
                            <h3 className="text-white font-serif text-xl">{customPieces[selectedImage].title}</h3>
                            <p className="text-white/60 text-sm mt-1">{customPieces[selectedImage].desc}</p>
                        </div>

                        {/* Navigation arrows */}
                        <div className="absolute top-1/2 -translate-y-1/2 -left-14 hidden md:block">
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedImage(selectedImage === 0 ? customPieces.length - 1 : selectedImage - 1); }}
                                className="text-white/50 hover:text-white text-3xl transition-colors p-2"
                            >
                                ‹
                            </button>
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 -right-14 hidden md:block">
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedImage(selectedImage === customPieces.length - 1 ? 0 : selectedImage + 1); }}
                                className="text-white/50 hover:text-white text-3xl transition-colors p-2"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
