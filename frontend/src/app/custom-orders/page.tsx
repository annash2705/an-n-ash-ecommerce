"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";

export default function CustomOrdersPage() {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", jewelryType: "Necklace", description: "", budgetRange: "" });
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
                const uploadData = new FormData();
                uploadData.append("image", file);
                const { data: uploadRes } = await api.post("/upload/public", uploadData, { headers: { "Content-Type": "multipart/form-data" } });
                imageBlob = uploadRes;
            }
            await api.post("/custom-requests", { ...formData, imageBlob });
            setSuccess(true);
            setFormData({ name: "", email: "", phone: "", jewelryType: "Necklace", description: "", budgetRange: "" });
            setFile(null);
        } catch (error) { alert("Failed to submit request."); }
        finally { setLoading(false); }
    };

    return (
        <div className="bg-cream min-h-screen py-16 watercolor-bg">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-gold tracking-[0.3em] text-xs uppercase mb-3">✦ Custom Orders ✦</p>
                    <h1 className="text-4xl font-serif text-foreground mb-4">Create Your Magic</h1>
                    <p className="text-foreground/60 leading-relaxed">Have a dream piece in mind? Fill out the form below and let us bring your ethereal vision to life.</p>
                    <div className="gold-divider mt-6"><div className="gold-divider-gem" /></div>
                </div>

                {success ? (
                    <div className="card-premium p-10 text-center">
                        <div className="text-4xl mb-4">✦</div>
                        <h2 className="text-2xl font-serif text-gold mb-4">Request Received</h2>
                        <p className="text-foreground/70 leading-relaxed">Thank you for your custom request! We will review the details and get back to you within 24-48 hours via email to discuss the design and finalized quote.</p>
                        <Button onClick={() => setSuccess(false)} className="mt-8" variant="outline">Submit Another Request</Button>
                    </div>
                ) : (
                    <form onSubmit={submitHandler} className="card-premium p-6 sm:p-10 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Full Name *</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="input-elegant" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Email Address *</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="input-elegant" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Phone Number *</label>
                                <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="input-elegant" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Jewelry Type *</label>
                                <select name="jewelryType" value={formData.jewelryType} onChange={handleChange} className="input-elegant">
                                    <option value="Necklace">Necklace</option>
                                    <option value="Earrings">Earrings</option>
                                    <option value="Arm Cuff">Arm Cuff</option>
                                    <option value="Ring">Ring</option>
                                    <option value="Hair Accessory">Hair Accessory</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Description *</label>
                                <p className="text-xs text-foreground/50 mb-2">Describe your vision, materials, colors, and any specific details.</p>
                                <textarea required name="description" rows={5} value={formData.description} onChange={handleChange} className="input-elegant resize-none" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Budget Range (in INR) *</label>
                                <input required type="text" name="budgetRange" placeholder="e.g. 5000 - 8000" value={formData.budgetRange} onChange={handleChange} className="input-elegant" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Reference Image (Optional)</label>
                                <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="input-elegant text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-gold/10 file:text-gold file:font-medium hover:file:bg-gold/20 file:cursor-pointer" />
                            </div>
                        </div>
                        <div className="pt-4">
                            <Button fullWidth size="lg" type="submit" disabled={loading}>{loading ? "Submitting..." : "Send Request"}</Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
