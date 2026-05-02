"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";

export default function ProductDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [qty, setQty] = useState(1);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Review state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [reviewSuccess, setReviewSuccess] = useState("");

    const fetchProduct = async () => {
        try {
            const { data } = await api.get(`/products/${id}`);
            setProduct(data);
        } catch (err) {
            setError("Product not found or failed to load.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({
            product: product._id,
            name: product.name,
            image: (product.images && product.images[0]?.url) || "",
            price: product.price,
            qty,
            countInStock: product.countInStock,
        });
        router.push("/cart");
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setReviewLoading(true);
        setReviewError("");
        setReviewSuccess("");

        try {
            await api.post(`/products/${id}/reviews`, { rating, comment });
            setReviewSuccess("Review submitted successfully!");
            setComment("");
            setRating(5);
            fetchProduct(); // Refresh to show new review
        } catch (err: any) {
            setReviewError(err.response?.data?.message || "Failed to submit review.");
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-cream">
            <div className="animate-pulse text-gold text-lg">Loading magic...</div>
        </div>
    );

    if (error || !product) return (
        <div className="min-h-screen flex items-center justify-center bg-cream">
            <div className="text-center">
                <p className="text-red-500 text-lg mb-4">{error || "Product not found"}</p>
                <Button variant="outline" onClick={() => router.push("/shop")}>Back to Shop</Button>
            </div>
        </div>
    );

    return (
        <div className="bg-cream min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
                    {/* Image Gallery */}
                    <div className="mb-10 lg:mb-0">
                        <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-beige bg-white">
                            <img
                                src={(product.images && product.images[0]?.url) || "https://via.placeholder.com/800?text=No+Image"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Additional images */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2 mt-4">
                                {product.images.map((img: any, idx: number) => (
                                    <div key={idx} className="aspect-square rounded-lg border border-beige overflow-hidden bg-white">
                                        <img src={img.url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <p className="text-gold uppercase tracking-widest text-sm mb-2">{product.category}</p>
                        <h1 className="text-3xl sm:text-4xl font-serif text-foreground mb-4">{product.name}</h1>
                        <p className="text-2xl text-foreground font-medium mb-2">₹{product.price}</p>

                        {/* Rating display */}
                        {product.numReviews > 0 && (
                            <div className="flex items-center mb-4 text-sm text-foreground">
                                <span className="text-gold mr-1">{"★".repeat(Math.round(product.rating))}</span>
                                <span className="text-gray-400">{"★".repeat(5 - Math.round(product.rating))}</span>
                                <span className="ml-2">({product.numReviews} review{product.numReviews !== 1 ? 's' : ''})</span>
                            </div>
                        )}

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
                            <div>
                                <span className="font-semibold text-foreground">Availability:</span>{" "}
                                <span className={product.countInStock > 0 ? "text-green-600" : "text-red-500"}>
                                    {product.countInStock > 0 ? `In Stock (${product.countInStock})` : "Out of Stock"}
                                </span>
                            </div>
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
                                    {[...Array(product.countInStock > 0 ? Math.min(product.countInStock, 10) : 1).keys()].map(x => (
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

                {/* Reviews Section */}
                <div className="mt-16 border-t border-beige pt-12">
                    <h2 className="text-2xl font-serif text-foreground mb-8">Customer Reviews</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Existing Reviews */}
                        <div>
                            {product.reviews && product.reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {product.reviews.map((review: any, idx: number) => (
                                        <div key={idx} className="bg-white border border-beige rounded-xl p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-foreground">{review.name}</h4>
                                                <span className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-gold text-sm mb-2">
                                                {"★".repeat(review.rating)}
                                                <span className="text-gray-300">{"★".repeat(5 - review.rating)}</span>
                                            </div>
                                            <p className="text-foreground text-sm">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-foreground opacity-60">No reviews yet. Be the first to share your thoughts!</p>
                            )}
                        </div>

                        {/* Write a Review */}
                        <div>
                            <h3 className="font-serif text-lg text-foreground mb-4">Write a Review</h3>
                            {user ? (
                                <form onSubmit={handleSubmitReview} className="bg-white border border-beige rounded-xl p-6 space-y-4">
                                    {reviewError && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{reviewError}</div>}
                                    {reviewSuccess && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{reviewSuccess}</div>}

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Rating</label>
                                        <select
                                            value={rating}
                                            onChange={(e) => setRating(Number(e.target.value))}
                                            className="w-full border border-beige rounded-sm p-2 text-sm focus:outline-none focus:border-gold"
                                        >
                                            <option value={5}>★★★★★ - Excellent</option>
                                            <option value={4}>★★★★☆ - Very Good</option>
                                            <option value={3}>★★★☆☆ - Good</option>
                                            <option value={2}>★★☆☆☆ - Fair</option>
                                            <option value={1}>★☆☆☆☆ - Poor</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Comment</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Share your experience with this piece..."
                                            className="w-full border border-beige rounded-sm p-3 text-sm focus:outline-none focus:border-gold"
                                        ></textarea>
                                    </div>
                                    <Button type="submit" disabled={reviewLoading}>
                                        {reviewLoading ? "Submitting..." : "Submit Review"}
                                    </Button>
                                </form>
                            ) : (
                                <div className="bg-white border border-beige rounded-xl p-6 text-center">
                                    <p className="text-foreground mb-4">Please sign in to write a review.</p>
                                    <Button variant="outline" onClick={() => router.push(`/login?redirect=/product/${id}`)}>Sign In</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
