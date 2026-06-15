"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

const CATEGORIES = ["Necklaces", "Earrings", "Arm Cuffs", "Hair Accessories", "Rings", "Bag Charms", "Bracelets"];

export default function ProductEditPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Necklaces");
    const [countInStock, setCountInStock] = useState(0);
    const [materials, setMaterials] = useState("");
    const [isHandmade, setIsHandmade] = useState(true);
    const [images, setImages] = useState<any[]>([]);

    const [weight, setWeight] = useState(0.1);
    const [length, setLength] = useState(10);
    const [width, setWidth] = useState(10);
    const [height, setHeight] = useState(10);
    const [fragile, setFragile] = useState(false);
    const [requiresSpecialPackaging, setRequiresSpecialPackaging] = useState(false);
    const [shippingClass, setShippingClass] = useState("Standard");
    const [hsnCode, setHsnCode] = useState("711319");
    const [countryOfOrigin, setCountryOfOrigin] = useState("India");

    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${productId}`);
                setName(data.name);
                setPrice(data.price);
                setDescription(data.description);
                setCategory(data.category);
                setCountInStock(data.countInStock);
                setMaterials(data.materials);
                setIsHandmade(data.isHandmade);
                setImages(data.images || []);
                if (data.shippingConfig) {
                    setWeight(data.shippingConfig.weight || 0.1);
                    setLength(data.shippingConfig.length || 10);
                    setWidth(data.shippingConfig.width || 10);
                    setHeight(data.shippingConfig.height || 10);
                    setFragile(!!data.shippingConfig.fragile);
                    setRequiresSpecialPackaging(!!data.shippingConfig.requiresSpecialPackaging);
                    setShippingClass(data.shippingConfig.shippingClass || "Standard");
                    setHsnCode(data.shippingConfig.hsnCode || "711319");
                    setCountryOfOrigin(data.shippingConfig.countryOfOrigin || "India");
                }
            } catch (err) {
                setError("Error fetching product");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size client-side
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB.");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);
        setUploading(true);

        try {
            const config = {
                headers: { "Content-Type": "multipart/form-data" },
            };
            const { data } = await api.post("/upload", formData, config);
            // Append new image to existing images instead of replacing
            setImages(prev => [...prev, { url: data.url, public_id: data.public_id }]);
        } catch (err) {
            alert("Image upload failed. Ensure Cloudinary credentials are correct.");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (idx: number) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/products/${productId}`, {
                name,
                price,
                description,
                category,
                countInStock,
                materials,
                isHandmade,
                images,
                shippingConfig: {
                    weight,
                    length,
                    width,
                    height,
                    fragile,
                    requiresSpecialPackaging,
                    shippingClass,
                    hsnCode,
                    countryOfOrigin
                }
            });
            router.push("/admin/products");
        } catch (err: any) {
            const msg = err.response?.data?.errors
                ? err.response.data.errors.join(", ")
                : err.response?.data?.message || "Error updating product";
            alert(msg);
        }
    };

    if (loading) return (
        <div className="max-w-3xl mx-auto animate-pulse space-y-6">
            <div className="h-8 bg-beige rounded w-48"></div>
            <div className="bg-white p-8 border border-beige rounded-xl shadow-sm space-y-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-beige rounded"></div>)}
            </div>
        </div>
    );
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif text-foreground">Edit Product</h1>
                <Link href="/admin/products" className="text-gold hover:underline text-sm uppercase tracking-widest">
                    Go Back
                </Link>
            </div>

            <div className="bg-white p-8 border border-beige rounded-xl shadow-sm">
                <form onSubmit={submitHandler} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Price (₹)</label>
                            <input required type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Count In Stock</label>
                            <input required type="number" min="0" value={countInStock} onChange={(e) => setCountInStock(Number(e.target.value))} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Materials</label>
                            <input type="text" value={materials} onChange={(e) => setMaterials(e.target.value)} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                            <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold"></textarea>
                        </div>

                        <div className="md:col-span-2 flex items-center">
                            <input type="checkbox" id="isHandmade" checked={isHandmade} onChange={(e) => setIsHandmade(e.target.checked)} className="h-4 w-4 text-gold border-beige rounded focus:ring-gold" />
                            <label htmlFor="isHandmade" className="ml-2 block text-sm text-foreground">Is Handmade</label>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Product Images</label>
                            {images.length > 0 && (
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img src={getOptimizedImageUrl(img.url)} alt={`Product ${idx + 1}`} className="w-24 h-24 object-cover rounded-md border border-beige" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={uploadFileHandler} className="w-full border border-beige bg-gray-50 rounded-sm p-3 focus:outline-none focus:border-gold" />
                            {uploading && <p className="text-sm mt-2 text-gold">Uploading image...</p>}
                        </div>

                        {/* Shipping Configuration Section */}
                        <div className="md:col-span-2 pt-6 border-t border-beige">
                            <h3 className="text-lg font-serif text-foreground mb-4">Shipping Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Weight (kg)</label>
                                    <input required type="number" step="0.001" min="0.001" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Length (cm)</label>
                                    <input required type="number" min="1" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Width (cm)</label>
                                    <input required type="number" min="1" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Height (cm)</label>
                                    <input required type="number" min="1" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Shipping Class</label>
                                    <select value={shippingClass} onChange={(e) => setShippingClass(e.target.value)} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold">
                                        <option value="Standard">Standard</option>
                                        <option value="Express">Express</option>
                                        <option value="Fragile">Fragile</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">HSN Code</label>
                                    <input required type="text" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Country of Origin</label>
                                    <input required type="text" value={countryOfOrigin} onChange={(e) => setCountryOfOrigin(e.target.value)} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                                </div>
                                <div className="flex items-center mt-6">
                                    <input type="checkbox" id="fragile" checked={fragile} onChange={(e) => setFragile(e.target.checked)} className="h-4 w-4 text-gold border-beige rounded focus:ring-gold" />
                                    <label htmlFor="fragile" className="ml-2 block text-sm text-foreground font-medium">Fragile Item</label>
                                </div>
                                <div className="flex items-center mt-6">
                                    <input type="checkbox" id="specialPkg" checked={requiresSpecialPackaging} onChange={(e) => setRequiresSpecialPackaging(e.target.checked)} className="h-4 w-4 text-gold border-beige rounded focus:ring-gold" />
                                    <label htmlFor="specialPkg" className="ml-2 block text-sm text-foreground font-medium">Special Packaging</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-beige">
                        <Button type="submit" size="lg">Update Product</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
