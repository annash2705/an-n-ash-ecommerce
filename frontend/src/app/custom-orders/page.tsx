"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";

export default function CustomOrdersPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        jewelryType: "Necklace",
        description: "",
        budgetRange: "",
    });
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageBlob = null;
            if (file) {
                // Upload image if provided
                const uploadData = new FormData();
                uploadData.append("image", file);
                const { data: uploadRes } = await api.post("/upload", uploadData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                imageBlob = uploadRes;
            }

            await api.post("/custom-requests", {
                ...formData,
                imageBlob
            });

            setSuccess(true);
            setFormData({ name: "", email: "", phone: "", jewelryType: "Necklace", description: "", budgetRange: "" });
            setFile(null);
        } catch (error) {
            alert("Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-cream min-h-screen py-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif text-foreground mb-4">Create Your Magic</h1>
                    <p className="text-foreground">
                        Have a dream piece in mind? Fill out the form below and let us bring your ethereal vision to life.
                    </p>
                </div>

                {success ? (
                    <div className="bg-white p-8 text-center rounded-xl border border-beige shadow-sm">
                        <h2 className="text-2xl font-serif text-gold-dark mb-4">Request Received</h2>
                        <p className="text-foreground">Thank you for your custom request! We will review the details and get back to you within 24-48 hours via email to discuss the design and finalized quote.</p>
                        <Button onClick={() => setSuccess(false)} className="mt-6" variant="outline">Submit Another Request</Button>
                    </div>
                ) : (
                    <form onSubmit={submitHandler} className="bg-white p-6 sm:p-10 rounded-xl border border-beige shadow-sm space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Email Address *</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-1">Phone Number *</label>
                                <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-1">Jewelry Type *</label>
                                <select name="jewelryType" value={formData.jewelryType} onChange={handleChange} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold">
                                    <option value="Necklace">Necklace</option>
                                    <option value="Earrings">Earrings</option>
                                    <option value="Arm Cuff">Arm Cuff</option>
                                    <option value="Ring">Ring</option>
                                    <option value="Hair Accessory">Hair Accessory</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-1">Description *</label>
                                <p className="text-xs text-foreground mb-2">Describe your vision, materials, colors, and any specific details.</p>
                                <textarea required name="description" rows={5} value={formData.description} onChange={handleChange} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold"></textarea>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-1">Budget Range (in INR) *</label>
                                <input required type="text" name="budgetRange" placeholder="e.g. 5000 - 8000" value={formData.budgetRange} onChange={handleChange} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold" />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-1">Reference Image (Optional)</label>
                                <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="w-full border border-beige rounded-sm p-3 focus:outline-none focus:border-gold bg-gray-50 text-sm" />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button fullWidth size="lg" type="submit" disabled={loading}>
                                {loading ? "Submitting..." : "Send Request"}
                            </Button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
}
