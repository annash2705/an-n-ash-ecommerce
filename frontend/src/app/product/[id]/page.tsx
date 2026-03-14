"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";

export default function ProductDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const [qty, setQty] = useState(1);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setProduct(data);
            } catch (error) {
                // Fallback to mock if API gives 404/500
                console.log("Mocking product details due to API error");
                setProduct({
                    _id: id,
                    name: "Ethereal Pearl Choker",
                    price: 3200,
                    description: "A delicate choker adorned with natural freshwater pearls. This piece is perfect for an elegant evening or a whimsical day out.",
                    materials: "14k Gold fill, Freshwater Pearls",
                    category: "Necklaces",
                    isHandmade: true,
                    countInStock: 5,
                    image: "https://images.unsplash.com/photo-1599643478524-fb66f70d00f8?w=800"
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream"><p>Loading magic...</p></div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center bg-cream"><p>Product not found</p></div>;

    const handleAddToCart = () => {
        addToCart({
            product: product._id,
            name: product.name,
            image: product.image || (product.images && product.images[0]?.url) || "",
            price: product.price,
            qty,
        });
        router.push("/cart");
    };

    return (
        <div className="bg-cream min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
                    {/* Image Gallery */}
                    <div className="mb-10 lg:mb-0">
                        <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-beige bg-white">
                            <img
                                src={product.image || (product.images && product.images[0]?.url) || "https://via.placeholder.com/800"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <p className="text-gold uppercase tracking-widest text-sm mb-2">{product.category}</p>
                        <h1 className="text-3xl sm:text-4xl font-serif text-foreground mb-4">{product.name}</h1>
                        <p className="text-2xl text-foreground font-medium mb-6">₹{product.price}</p>

                        <div className="prose prose-sm text-foreground mb-8">
                            <p>{product.description}</p>
                        </div>

                        <div className="border-t border-b border-beige py-6 mb-8 space-y-4">
                            <div>
                                <span className="font-semibold text-foreground">Materials:</span> <span className="text-foreground">{product.materials || "Ethically sourced materials"}</span>
                            </div>
                            {product.isHandmade && (
                                <div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-soft text-foreground">
                                        ✨ Handmade with love
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Add to Cart Actions */}
                        <div className="mt-auto">
                            <div className="flex items-center space-x-4 mb-6">
                                <span className="text-foreground font-medium">Quantity</span>
                                <select
                                    value={qty}
                                    onChange={(e) => setQty(Number(e.target.value))}
                                    className="border border-beige rounded-sm p-2 w-20 focus:outline-none focus:border-gold"
                                    disabled={product.countInStock === 0}
                                >
                                    {[...Array(product.countInStock > 0 ? Math.min(product.countInStock, 5) : 1).keys()].map(x => (
                                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex space-x-4">
                                <Button
                                    fullWidth
                                    size="lg"
                                    onClick={handleAddToCart}
                                    disabled={product.countInStock === 0}
                                >
                                    {product.countInStock === 0 ? "Out of Stock" : "Add to Cart"}
                                </Button>
                            </div>

                            {product.countInStock > 0 && product.countInStock <= 3 && (
                                <p className="text-red-400 text-sm mt-3 text-center">Only {product.countInStock} pieces left!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
