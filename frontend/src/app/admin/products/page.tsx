"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get("/products");
            setProducts(data);
        } catch (error) {
            console.log("Error fetching products");
        } finally {
            setLoading(false);
        }
    };

    const createProductHandler = async () => {
        try {
            await api.post("/products");
            fetchProducts();
        } catch (error) {
            alert("Failed to create product");
        }
    };

    const deleteHandler = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                alert('Failed to delete');
            }
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif text-foreground">Products</h1>
                <Button onClick={createProductHandler}>+ Create Product</Button>
            </div>

            <div className="bg-white border border-beige rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <p className="p-6">Loading...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-cream border-b border-beige">
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">ID</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">NAME</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">PRICE</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">CATEGORY</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground">STOCK</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-foreground text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product: any) => (
                                    <tr key={product._id} className="border-b border-beige last:border-b-0 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-foreground">{product._id.substring(0, 8)}...</td>
                                        <td className="py-3 px-4 text-sm text-foreground font-medium">{product.name}</td>
                                        <td className="py-3 px-4 text-sm text-foreground">₹{product.price}</td>
                                        <td className="py-3 px-4 text-sm text-foreground">{product.category}</td>
                                        <td className="py-3 px-4 text-sm text-foreground">{product.countInStock}</td>
                                        <td className="py-3 px-4 text-sm text-right space-x-2">
                                            <Link href={`/admin/products/${product._id}/edit`}>
                                                <Button variant="outline" size="sm">Edit</Button>
                                            </Link>
                                            <Button variant="ghost" size="sm" onClick={() => deleteHandler(product._id)} className="text-red-500 hover:bg-red-50">Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
