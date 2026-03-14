"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import api from "@/lib/axios";

// Mock fallbacks if API is empty
const MOCK_PRODUCTS = [
    { _id: "1", name: "Ethereal Pearl Choker", price: 3200, category: "Necklaces", image: "https://images.unsplash.com/photo-1599643478524-fb66f70d00f8?w=800" },
    { _id: "2", name: "Golden Leaf Drop Earrings", price: 1800, category: "Earrings", image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800" },
    { _id: "3", name: "Rose Quartz Healing Ring", price: 2500, category: "Rings", image: "https://images.unsplash.com/photo-1605100804763-247f67b2548e?w=800" },
    { _id: "4", name: "Bohemian Arm Cuff", price: 2100, category: "Arm Cuffs", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800" },
    { _id: "5", name: "Starlet Hair Vine", price: 1500, category: "Hair Accessories", image: "https://images.unsplash.com/photo-1599643478524-fb66f70d00f8?w=800" }, // Reused image for mock
    { _id: "6", name: "Sunburst Pendant", price: 2800, category: "Necklaces", image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800" }, // Reused image
];

export default function ShopPage() {
    const [products, setProducts] = useState(MOCK_PRODUCTS);
    const [filteredProducts, setFilteredProducts] = useState(MOCK_PRODUCTS);
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("newest");

    useEffect(() => {
        // Attempt to fetch from real API
        const fetchProducts = async () => {
            try {
                const { data } = await api.get("/products");
                if (data && data.length > 0) {
                    // Flatten images structure to match mock for simple rendering
                    const formatted = data.map((p: any) => ({
                        ...p,
                        image: p.images && p.images.length > 0 ? p.images[0].url : "https://via.placeholder.com/800x1000"
                    }));
                    setProducts(formatted);
                    setFilteredProducts(formatted);
                }
            } catch (error) {
                console.log("Using mock data as API failed or empty");
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        let result = [...products];

        // Filter
        if (category !== "All") {
            result = result.filter(p => p.category === category);
        }

        // Sort
        if (sort === "price-low") {
            result.sort((a, b) => a.price - b.price);
        } else if (sort === "price-high") {
            result.sort((a, b) => b.price - a.price);
        } // "newest" or default relies on initial/fetched order usually, or could sort by ID string comparison for mocks

        setFilteredProducts(result);
    }, [category, sort, products]);

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
                                    <option value="popular">Best Selling</option>
                                </select>
                            </div>

                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-grow">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-sm text-foreground">Showing {filteredProducts.length} results for {category === 'All' ? 'everything' : category}</p>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white border border-beige rounded-xl">
                                <p className="text-foreground text-lg">No pieces found matching your criteria.</p>
                                <button onClick={() => { setCategory('All'); setSort('newest'); }} className="mt-4 text-gold hover:underline">Clear Filters</button>
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
