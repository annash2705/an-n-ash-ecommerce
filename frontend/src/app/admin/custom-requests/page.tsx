"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function AdminCustomRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await api.get("/custom-requests");
            setRequests(data);
        } catch (error) {
            console.log("Error fetching requests");
        } finally {
            setLoading(false);
        }
    };

    const statusChangeHandler = async (id: string, newStatus: string) => {
        try {
            await api.put(`/custom-requests/${id}/status`, { status: newStatus });
            fetchRequests();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-serif text-foreground mb-8">Custom Bespoke Requests</h1>

            <div className="space-y-6">
                {loading ? (
                    <p>Loading requests...</p>
                ) : requests.length === 0 ? (
                    <div className="bg-white p-6 border border-beige rounded-xl text-center">
                        <p className="text-foreground">No bespoke requests received yet.</p>
                    </div>
                ) : (
                    requests.map((req: any) => (
                        <div key={req._id} className="bg-white border border-beige rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                            {/* Optional Reference Image */}
                            {req.referenceImage && req.referenceImage.url ? (
                                <div className="w-full md:w-64 h-48 md:h-auto bg-gray-100 flex-shrink-0">
                                    <img src={req.referenceImage.url} alt="Reference" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-full md:w-64 h-48 md:h-auto bg-beige flex items-center justify-center flex-shrink-0">
                                    <span className="text-gray-400 text-sm">No Image</span>
                                </div>
                            )}

                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-serif text-foreground">{req.name} <span className="text-sm font-sans tracking-widest text-gold text-opacity-80">| {req.jewelryType}</span></h3>
                                            <p className="text-sm text-gray-500 mt-1">{req.email} • {req.phone}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm text-foreground bg-pink-soft px-3 py-1 rounded-full">{req.budgetRange}</span>
                                            <p className="text-xs text-gray-400 mt-2">{new Date(req.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <p className="text-foreground text-sm leading-relaxed mb-6 italic">"{req.description}"</p>
                                </div>

                                <div className="border-t border-beige pt-4 flex items-center justify-between">
                                    <span className="text-sm font-medium text-foreground">Update Status:</span>
                                    <select
                                        value={req.status}
                                        onChange={(e) => statusChangeHandler(req._id, e.target.value)}
                                        className="border border-beige rounded-sm p-2 text-sm bg-white focus:outline-none focus:border-gold font-semibold"
                                    >
                                        <option value="Pending">Pending Review</option>
                                        <option value="Reviewed">Reviewed & Replied</option>
                                        <option value="Accepted">Accepted & Processing</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
