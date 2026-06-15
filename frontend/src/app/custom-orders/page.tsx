"use client";

import { useState } from "react";

const customPieces = [
    { 
        src: "/custom-work/piece-3.jpg", 
        category: "Collar Necklace",
        materials: "Freshwater Pearls & 14k Gold Wire",
        title: "The Aura Pearl Choker", 
        desc: "Luminous freshwater pearls elegantly draped along fine gold chains, punctuated by handcrafted wirework butterflies that catch the light." 
    },
    { 
        src: "/custom-work/piece-1.jpg", 
        category: "Ear Cuff",
        materials: "Silver Wire & Teal Glass Blooms",
        title: "The Flora Wire Cuff", 
        desc: "Intricately hand-shaped silver wire designed to trace the ear, blossoming with translucent seafoam glass flowers and light-catching crystal droplets." 
    },
    { 
        src: "/custom-work/piece-4.jpg", 
        category: "Drop Earrings",
        materials: "Gold Fill & Amethyst Drops",
        title: "Amethyst Helix Drops", 
        desc: "Graceful golden spirals cascade downward, suspending violet teardrop cat-eye beads that sway beautifully with every movement." 
    },
    { 
        src: "/custom-work/piece-5.jpg", 
        category: "Chandelier Earrings",
        materials: "Silver Wire & Emerald Crystals",
        title: "Emerald Palace Chandeliers", 
        desc: "Intricately woven silver wire chandelier earrings adorned with vibrant emerald crystal beads and hanging chain drops." 
    },
    { 
        src: "/custom-work/piece-6.jpg", 
        category: "Drop Earrings",
        materials: "14k Gold Wire & Natural Jade",
        title: "Nouveau Emerald Drops", 
        desc: "Hand-shaped golden scrolls cradling smooth jade stones, terminating in delicate aventurine droplets that catch soft shadows." 
    },
    { 
        src: "/custom-work/piece-7.jpg", 
        category: "Drop Earrings",
        materials: "14k Gold Wire & Rose Quartz",
        title: "Aurelia Rose Drops", 
        desc: "Whisper-light gold wire scrolls holding pink cat-eye beads and terminating in smooth rose quartz teardrops." 
    },
    { 
        src: "/custom-work/piece-8.jpg", 
        category: "Chandelier Earrings",
        materials: "Sterling Silver & Clear Crystals",
        title: "Celestia Spiral Drops", 
        desc: "Dreamy silver wire spirals adorned with delicate silver beads and hanging crystal teardrops that mimic falling rain." 
    },
    { 
        src: "/custom-work/piece-2.jpg", 
        category: "Statement Collar",
        materials: "Frosted Glass Lily & Green Jade",
        title: "The Nouveau Lily Necklace", 
        desc: "A bespoke collar of seed pearls and jade beads leading to a hand-sculpted frosted glass lily with delicate wirework dripping drops." 
    },
];

export default function CustomOrdersPage() {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    return (
        <div className="bg-cream min-h-screen watercolor-bg">
            {/* Hero header */}
            <div className="pt-24 pb-16 text-center px-4 max-w-3xl mx-auto">
                <p className="text-gold tracking-[0.35em] text-xs uppercase mb-3 animate-fade-in-up font-medium">✦ The Archive ✦</p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-6 tracking-wide animate-fade-in-up-delay">
                    Our Handcrafted Work
                </h1>
                <p className="text-foreground/75 leading-relaxed font-sans italic text-base md:text-lg animate-fade-in-up-delay max-w-xl mx-auto">
                    A curated showcase of bespoke, one-of-a-kind creations meticulously wire-sculpted by hand to tell a personal story.
                </p>
                <div className="gold-divider mt-8"><div className="gold-divider-gem" /></div>
            </div>

            {/* Gallery Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
                    
                    {/* Row 1: Aura Pearl Choker (Hero - 7 cols) & Flora Wire Cuff (5 cols) */}
                    <div 
                        className="lg:col-span-7 group cursor-pointer bg-white/60 backdrop-blur-md border border-gold/15 rounded-3xl shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-700 ease-out overflow-hidden flex flex-col justify-between"
                        onClick={() => setSelectedImage(0)}
                    >
                        <div className="p-3 bg-cream/40 border-b border-gold/10">
                            <div className="overflow-hidden rounded-2xl aspect-[4/5] relative">
                                <img
                                    src={customPieces[0].src}
                                    alt={customPieces[0].title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                                />
                            </div>
                        </div>
                        <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium block mb-2">{customPieces[0].category}</span>
                                <h3 className="text-2xl font-serif text-foreground tracking-wide group-hover:text-gold transition-colors duration-500">{customPieces[0].title}</h3>
                                <p className="text-foreground/75 text-sm mt-3 leading-relaxed font-sans font-light">{customPieces[0].desc}</p>
                            </div>
                            <div className="mt-8 pt-4 border-t border-beige/60 flex items-center justify-between">
                                <span className="text-xs text-foreground/50 tracking-wider font-sans">{customPieces[0].materials}</span>
                                <span className="text-xs uppercase tracking-widest text-gold font-medium inline-flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform duration-500">
                                    Enquire <span className="text-[10px]">✦</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div 
                        className="lg:col-span-5 group cursor-pointer bg-white/60 backdrop-blur-md border border-gold/15 rounded-3xl shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-700 ease-out overflow-hidden flex flex-col justify-between"
                        onClick={() => setSelectedImage(1)}
                    >
                        <div className="p-3 bg-cream/40 border-b border-gold/10">
                            <div className="overflow-hidden rounded-2xl aspect-[4/5] relative">
                                <img
                                    src={customPieces[1].src}
                                    alt={customPieces[1].title}
                                    className="w-full h-full object-cover object-[center_35%] group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                                />
                            </div>
                        </div>
                        <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium block mb-2">{customPieces[1].category}</span>
                                <h3 className="text-xl font-serif text-foreground tracking-wide group-hover:text-gold transition-colors duration-500">{customPieces[1].title}</h3>
                                <p className="text-foreground/75 text-sm mt-2 leading-relaxed font-sans font-light">{customPieces[1].desc}</p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-beige/60 flex items-center justify-between">
                                <span className="text-xs text-foreground/50 tracking-wider font-sans">{customPieces[1].materials}</span>
                                <span className="text-xs uppercase tracking-widest text-gold font-medium inline-flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform duration-500">
                                    Enquire <span className="text-[10px]">✦</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: 3-column details (4 cols each) - Amethyst Helix, Emerald Palace, Nouveau Emerald */}
                    <div 
                        className="lg:col-span-4 group cursor-pointer bg-white/60 backdrop-blur-md border border-gold/15 rounded-3xl shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-700 ease-out overflow-hidden flex flex-col justify-between"
                        onClick={() => setSelectedImage(2)}
                    >
                        <div className="p-3 bg-cream/40 border-b border-gold/10">
                            <div className="overflow-hidden rounded-2xl aspect-[4/5] relative">
                                <img
                                    src={customPieces[2].src}
                                    alt={customPieces[2].title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                                />
                            </div>
                        </div>
                        <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium block mb-2">{customPieces[2].category}</span>
                                <h3 className="text-xl font-serif text-foreground tracking-wide group-hover:text-gold transition-colors duration-500">{customPieces[2].title}</h3>
                                <p className="text-foreground/75 text-sm mt-2 leading-relaxed font-sans font-light">{customPieces[2].desc}</p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-beige/60 flex items-center justify-between">
                                <span className="text-xs text-foreground/50 tracking-wider font-sans">{customPieces[2].materials}</span>
                                <span className="text-xs uppercase tracking-widest text-gold font-medium inline-flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform duration-500">
                                    Enquire <span className="text-[10px]">✦</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div 
                        className="lg:col-span-4 group cursor-pointer bg-white/60 backdrop-blur-md border border-gold/15 rounded-3xl shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-700 ease-out overflow-hidden flex flex-col justify-between"
                        onClick={() => setSelectedImage(3)}
                    >
                        <div className="p-3 bg-cream/40 border-b border-gold/10">
                            <div className="overflow-hidden rounded-2xl aspect-[4/5] relative">
                                <img
                                    src={customPieces[3].src}
                                    alt={customPieces[3].title}
                                    className="w-full h-full object-cover object-[center_30%] group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                                />
                            </div>
                        </div>
                        <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium block mb-2">{customPieces[3].category}</span>
                                <h3 className="text-xl font-serif text-foreground tracking-wide group-hover:text-gold transition-colors duration-500">{customPieces[3].title}</h3>
                                <p className="text-foreground/75 text-sm mt-2 leading-relaxed font-sans font-light">{customPieces[3].desc}</p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-beige/60 flex items-center justify-between">
                                <span className="text-xs text-foreground/50 tracking-wider font-sans">{customPieces[3].materials}</span>
                                <span className="text-xs uppercase tracking-widest text-gold font-medium inline-flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform duration-500">
                                    Enquire <span className="text-[10px]">✦</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div 
                        className="lg:col-span-4 group cursor-pointer bg-white/60 backdrop-blur-md border border-gold/15 rounded-3xl shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-700 ease-out overflow-hidden flex flex-col justify-between"
                        onClick={() => setSelectedImage(4)}
                    >
                        <div className="p-3 bg-cream/40 border-b border-gold/10">
                            <div className="overflow-hidden rounded-2xl aspect-[4/5] relative">
                                <img
                                    src={customPieces[4].src}
                                    alt={customPieces[4].title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                                />
                            </div>
                        </div>
                        <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium block mb-2">{customPieces[4].category}</span>
                                <h3 className="text-xl font-serif text-foreground tracking-wide group-hover:text-gold transition-colors duration-500">{customPieces[4].title}</h3>
                                <p className="text-foreground/75 text-sm mt-2 leading-relaxed font-sans font-light">{customPieces[4].desc}</p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-beige/60 flex items-center justify-between">
                                <span className="text-xs text-foreground/50 tracking-wider font-sans">{customPieces[4].materials}</span>
                                <span className="text-xs uppercase tracking-widest text-gold font-medium inline-flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform duration-500">
                                    Enquire <span className="text-[10px]">✦</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Aurelia Rose Drops (6 cols) & Celestia Spiral Drops (6 cols) */}
                    <div 
                        className="lg:col-span-6 group cursor-pointer bg-white/60 backdrop-blur-md border border-gold/15 rounded-3xl shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-700 ease-out overflow-hidden flex flex-col justify-between"
                        onClick={() => setSelectedImage(5)}
                    >
                        <div className="p-3 bg-cream/40 border-b border-gold/10">
                            <div className="overflow-hidden rounded-2xl aspect-[4/5] relative">
                                <img
                                    src={customPieces[5].src}
                                    alt={customPieces[5].title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                                />
                            </div>
                        </div>
                        <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium block mb-2">{customPieces[5].category}</span>
                                <h3 className="text-xl font-serif text-foreground tracking-wide group-hover:text-gold transition-colors duration-500">{customPieces[5].title}</h3>
                                <p className="text-foreground/75 text-sm mt-2 leading-relaxed font-sans font-light">{customPieces[5].desc}</p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-beige/60 flex items-center justify-between">
                                <span className="text-xs text-foreground/50 tracking-wider font-sans">{customPieces[5].materials}</span>
                                <span className="text-xs uppercase tracking-widest text-gold font-medium inline-flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform duration-500">
                                    Enquire <span className="text-[10px]">✦</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div 
                        className="lg:col-span-6 group cursor-pointer bg-white/60 backdrop-blur-md border border-gold/15 rounded-3xl shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-700 ease-out overflow-hidden flex flex-col justify-between"
                        onClick={() => setSelectedImage(6)}
                    >
                        <div className="p-3 bg-cream/40 border-b border-gold/10">
                            <div className="overflow-hidden rounded-2xl aspect-[4/5] relative">
                                <img
                                    src={customPieces[6].src}
                                    alt={customPieces[6].title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                                />
                            </div>
                        </div>
                        <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium block mb-2">{customPieces[6].category}</span>
                                <h3 className="text-xl font-serif text-foreground tracking-wide group-hover:text-gold transition-colors duration-500">{customPieces[6].title}</h3>
                                <p className="text-foreground/75 text-sm mt-2 leading-relaxed font-sans font-light">{customPieces[6].desc}</p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-beige/60 flex items-center justify-between">
                                <span className="text-xs text-foreground/50 tracking-wider font-sans">{customPieces[6].materials}</span>
                                <span className="text-xs uppercase tracking-widest text-gold font-medium inline-flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform duration-500">
                                    Enquire <span className="text-[10px]">✦</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Row 4: Nouveau Lily Necklace (Landscape Hero - 12 cols) */}
                    <div 
                        className="lg:col-span-12 group cursor-pointer bg-white/60 backdrop-blur-md border border-gold/15 rounded-3xl shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-700 ease-out overflow-hidden mt-2"
                        onClick={() => setSelectedImage(7)}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                            <div className="lg:col-span-7 p-3 bg-cream/40 h-full border-b lg:border-b-0 lg:border-r border-gold/10">
                                <div className="overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[16/10] lg:aspect-[16/10] h-full">
                                    <img
                                        src={customPieces[7].src}
                                        alt={customPieces[7].title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                                    />
                                </div>
                            </div>
                            <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center">
                                <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium block mb-2">{customPieces[7].category}</span>
                                <h3 className="text-2xl lg:text-3xl font-serif text-foreground tracking-wide group-hover:text-gold transition-colors duration-500 mb-4">{customPieces[7].title}</h3>
                                <p className="text-foreground/75 text-sm lg:text-base leading-relaxed font-sans font-light mb-6">{customPieces[7].desc}</p>
                                
                                <div className="pt-6 border-t border-beige/60 flex items-center justify-between">
                                    <span className="text-xs text-foreground/50 tracking-wider font-sans">{customPieces[7].materials}</span>
                                    <span className="text-xs uppercase tracking-widest text-gold font-medium inline-flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform duration-500">
                                        Enquire <span className="text-[10px]">✦</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

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
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative max-w-4xl w-full animate-fade-in-up flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white/70 hover:text-white text-sm tracking-widest uppercase transition-colors"
                        >
                            ✕ Close
                        </button>

                        <div className="bg-cream max-h-[85vh] w-full rounded-3xl overflow-hidden border border-gold/25 shadow-2xl grid grid-cols-1 md:grid-cols-2">
                            {/* Left side: Image */}
                            <div className="bg-black/5 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gold/10">
                                <img
                                    src={customPieces[selectedImage].src}
                                    alt={customPieces[selectedImage].title}
                                    className="max-w-full max-h-[40vh] md:max-h-[75vh] object-contain rounded-xl shadow-md"
                                />
                            </div>
                            {/* Right side: Details */}
                            <div className="p-8 md:p-12 flex flex-col justify-between h-full bg-cream watercolor-bg">
                                <div>
                                    <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium block mb-2">{customPieces[selectedImage].category}</span>
                                    <h3 className="text-2xl md:text-3xl font-serif text-foreground tracking-wide mb-4">{customPieces[selectedImage].title}</h3>
                                    <div className="w-12 h-[1px] bg-gold/30 mb-6" />
                                    <p className="text-foreground/85 text-sm md:text-base leading-relaxed font-sans font-light mb-6">{customPieces[selectedImage].desc}</p>
                                </div>
                                
                                <div className="pt-6 border-t border-beige flex flex-col gap-6">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-wider text-foreground/40 block mb-1">Composition</span>
                                        <span className="text-sm text-foreground/80 font-sans">{customPieces[selectedImage].materials}</span>
                                    </div>
                                    <a
                                        href="https://www.instagram.com/an.n.ash/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full text-center py-4 bg-foreground hover:bg-gold text-white hover:text-white transition-all duration-500 rounded-xl text-xs uppercase tracking-widest font-medium"
                                    >
                                        Enquire on Instagram
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Navigation arrows (floating outside on desktop) */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(selectedImage === 0 ? customPieces.length - 1 : selectedImage - 1); }}
                            className="absolute top-1/2 -translate-y-1/2 -left-16 hidden lg:flex text-white/50 hover:text-white text-5xl transition-colors p-4"
                        >
                            ‹
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(selectedImage === customPieces.length - 1 ? 0 : selectedImage + 1); }}
                            className="absolute top-1/2 -translate-y-1/2 -right-16 hidden lg:flex text-white/50 hover:text-white text-5xl transition-colors p-4"
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
