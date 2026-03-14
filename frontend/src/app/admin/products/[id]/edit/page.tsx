"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { Button } from "@/components/ui/Button";

export default function ProductEditPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [countInStock, setCountInStock] = useState(0);
    const [materials, setMaterials] = useState("");
    const [isHandmade, setIsHandmade] = useState(true);
    const [images, setImages] = useState<any[]>([]);

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

        const formData = new FormData();
        formData.append("image", file);
        setUploading(true);

        try {
            const config = {
                headers: { "Content-Type": "multipart/form-data" },
            };
            const { data } = await api.post("/upload", formData, config);
            setImages([{ url: data.url, public_id: data.public_id }]);
        } catch (err) {
            alert("Image upload failed. Ensure Cloudinary credentials are correct.");
        } finally {
            setUploading(false);
        }
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userInfo = localStorage.getItem("userInfo");
            const token = userInfo ? JSON.parse(userInfo).token : "";
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await api.put(`/products/${productId}`, {
                name,
                price,
                description,
                category,
                countInStock,
                materials,
                isHandmade,
                images,
            }, config);
            router.push("/admin/products");
        } catch (err) {
            alert("Error updating product");
        }
    };

    if (loading) return <div>Loading...</div>;
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
                            <input required type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                            <input required type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Count In Stock</label>
                            <input required type="number" value={countInStock} onChange={(e) => setCountInStock(Number(e.target.value))} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
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
                            <label className="block text-sm font-medium text-foreground mb-1">Product Image</label>
                            {images.length > 0 && images[0].url && (
                                <div className="mb-4">
                                    <img src={images[0].url} alt="Product" className="w-32 h-32 object-cover rounded-md border border-beige" />
                                </div>
                            )}
                            <input type="file" onChange={uploadFileHandler} className="w-full border border-beige bg-gray-50 rounded-sm p-3 focus:outline-none focus:border-gold" />
                            {uploading && <p className="text-sm mt-2">Uploading image...</p>}
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
