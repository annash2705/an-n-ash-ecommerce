"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="bg-cream min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";

    const { user, login } = useAuth();

    useEffect(() => {
        if (user) {
            router.push(redirect);
        }
    }, [user, redirect, router]);

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data } = await api.post("/users/login", { email, password });
            login(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-cream min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-serif text-foreground">Sign in to your account</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm border border-beige sm:rounded-xl sm:px-10">

                    {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">{error}</div>}

                    <form className="space-y-6" onSubmit={submitHandler}>
                        <div>
                            <label className="block text-sm font-medium text-foreground">Email address</label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-beige rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground">Password</label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-beige rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <Button fullWidth type="submit" disabled={loading}>
                                {loading ? "Signing in..." : "Sign in"}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-foreground">
                            New customer?{' '}
                            <Link href={`/register?redirect=${redirect}`} className="font-medium text-gold hover:text-gold-dark">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
