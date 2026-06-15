"use client";

import { useState, useEffect, Suspense } from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import api from "@/lib/axios";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { useSearchParams } from "next/navigation";

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="bg-cream min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gold/60 tracking-widest text-sm uppercase">Loading collection...</p>
                </div>
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}

function ShopContent() {
    const searchParams = useSearchParams();
    const urlCategory = searchParams.get("category") || "All";

    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [category, setCategory] = useState(urlCategory);
    const [sort, setSort] = useState("newest");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const { data } = await api.get("/products");
                const allProducts = data.products || data;
                if (allProducts && allProducts.length > 0) {
                    const formatted = allProducts.map((p: any) => ({
                        ...p,
                        image: p.images && p.images.length > 0 ? getOptimizedImageUrl(p.images[0].url) : "https://via.placeholder.com/800x1000?text=No+Image"
                    }));
                    setProducts(formatted);
                } else {
                    setProducts([]);
                }
            } catch (err) {
                setError("Failed to load products. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        setCategory(urlCategory);
    }, [urlCategory]);

    useEffect(() => {
        let result = [...products];

        // Search
        if (searchKeyword.trim()) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchKeyword.toLowerCase())
            );
        }

        // Filter by category
        if (category !== "All") {
            result = result.filter(p => p.category === category);
        }

        // Sort
        if (sort === "price-low") {
            result.sort((a, b) => a.price - b.price);
        } else if (sort === "price-high") {
            result.sort((a, b) => b.price - a.price);
        } else if (sort === "popular") {
            result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        setFilteredProducts(result);
    }, [category, sort, products, searchKeyword]);

    const categories = ["All", "Necklaces", "Earrings", "Arm Cuffs", "Hair Accessories", "Rings", "Bag Charms", "Bracelets"];

    return (
        <div className="bg-cream min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-14">
                    <p className="text-gold tracking-[0.3em] text-xs uppercase mb-3">✦ Our Collection ✦</p>
                    <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Discover Magic</h1>
                    <p className="text-foreground/60 max-w-2xl mx-auto leading-relaxed">
                        Handmade jewelry inspired by art, nature, and the enchanting beauty of the everyday.
                    </p>
                    <div className="gold-divider mt-6">
                        <div className="gold-divider-gem" />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-10 max-w-xl mx-auto">
                    <input
                        type="text"
                        placeholder="Search jewelry by name..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="input-elegant w-full rounded-full px-7 py-3.5 text-sm shadow-sm"
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-10">
                    {/* Sidebar Filters */}
                    <div className="w-full md:w-60 flex-shrink-0">
                        <div className="sticky top-28 space-y-8">

                            <div>
                                <h3 className="font-serif text-base text-gold uppercase tracking-[0.15em] mb-4 pb-2 border-b border-gold-light/30">Categories</h3>
                                <ul className="space-y-1.5">
                                    {categories.map(c => (
                                        <li key={c}>
                                            <button
                                                onClick={() => setCategory(c)}
                                                className={`w-full text-left text-sm tracking-wide px-3 py-2 rounded-lg transition-all duration-300 ${
                                                    category === c 
                                                        ? 'text-gold bg-gold/5 font-semibold' 
                                                        : 'text-foreground/70 hover:text-gold hover:bg-gold/5'
                                                }`}
                                            >
                                                {c}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-serif text-base text-gold uppercase tracking-[0.15em] mb-4 pb-2 border-b border-gold-light/30">Sort By</h3>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="input-elegant text-sm"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="popular">Best Rated</option>
                                </select>
                            </div>

                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-grow">
                        <div className="flex justify-between items-center mb-8">
                            <p className="text-sm text-foreground/50 tracking-wide">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'} {category !== 'All' ? `in ${category}` : ''}
                            </p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="card-premium overflow-hidden animate-pulse">
                                        <div className="aspect-[4/5] bg-beige/60" />
                                        <div className="p-5 space-y-3">
                                            <div className="h-3 bg-beige/60 rounded-full w-1/3 mx-auto" />
                                            <div className="h-4 bg-beige/60 rounded-full w-2/3 mx-auto" />
                                            <div className="h-4 bg-beige/60 rounded-full w-1/4 mx-auto" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-20 card-premium">
                                <p className="text-red-400 text-lg mb-4">{error}</p>
                                <button onClick={() => window.location.reload()} className="text-gold hover:text-gold-dark transition-colors underline underline-offset-4">Try Again</button>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20 card-premium">
                                <p className="text-foreground/60 text-lg font-light italic mb-4">No pieces found matching your criteria.</p>
                                <button onClick={() => { setCategory('All'); setSort('newest'); setSearchKeyword(''); }} className="text-gold hover:text-gold-dark transition-colors underline underline-offset-4">Clear Filters</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
