"use client";

import { useState, useEffect, Suspense } from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import api from "@/lib/axios";
import { useSearchParams } from "next/navigation";

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="bg-cream min-h-screen flex items-center justify-center"><div className="animate-pulse text-gold text-lg">Loading collection...</div></div>}>
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
                        image: p.images && p.images.length > 0 ? p.images[0].url : "https://via.placeholder.com/800x1000?text=No+Image"
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

    const categories = ["All", "Necklaces", "Earrings", "Arm Cuffs", "Hair Accessories", "Rings"];

    return (
        <div className="bg-cream min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Our Collection</h1>
                    <p className="text-foreground max-w-2xl mx-auto">
                        Discover handmade jewelry inspired by art, nature, and magic.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-8 max-w-xl mx-auto">
                    <input
                        type="text"
                        placeholder="Search jewelry by name..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="w-full border border-beige rounded-full px-6 py-3 text-sm focus:outline-none focus:border-gold bg-white shadow-sm placeholder-gray-400"
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="sticky top-28 space-y-8">

                            <div>
                                <h3 className="font-serif text-lg text-foreground mb-4 border-b border-beige pb-2">Categories</h3>
                                <ul className="space-y-2">
                                    {categories.map(c => (
                                        <li key={c}>
                                            <button
                                                onClick={() => setCategory(c)}
                                                className={`text-sm tracking-wide ${category === c ? 'text-gold-dark font-semibold' : 'text-foreground hover:text-gold'} transition`}
                                            >
                                                {c}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-serif text-lg text-foreground mb-4 border-b border-beige pb-2">Sort By</h3>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="w-full bg-white border border-beige rounded-sm p-2 text-sm focus:outline-none focus:border-gold"
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
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-sm text-foreground">Showing {filteredProducts.length} results for {category === 'All' ? 'everything' : category}</p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-white border border-beige rounded-xl overflow-hidden animate-pulse">
                                        <div className="aspect-[4/5] bg-beige"></div>
                                        <div className="p-5 space-y-3">
                                            <div className="h-3 bg-beige rounded w-1/3 mx-auto"></div>
                                            <div className="h-4 bg-beige rounded w-2/3 mx-auto"></div>
                                            <div className="h-4 bg-beige rounded w-1/4 mx-auto"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-20 bg-white border border-beige rounded-xl">
                                <p className="text-red-500 text-lg mb-4">{error}</p>
                                <button onClick={() => window.location.reload()} className="text-gold hover:underline">Try Again</button>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white border border-beige rounded-xl">
                                <p className="text-foreground text-lg">No pieces found matching your criteria.</p>
                                <button onClick={() => { setCategory('All'); setSort('newest'); setSearchKeyword(''); }} className="mt-4 text-gold hover:underline">Clear Filters</button>
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
