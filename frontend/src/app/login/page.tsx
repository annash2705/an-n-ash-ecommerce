"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="bg-cream min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>}>
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

    useEffect(() => { if (user) router.push(redirect); }, [user, redirect, router]);

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const { data } = await api.post("/users/login", { email, password });
            login(data);
        } catch (err: any) {
            if (err.response?.data?.requiresVerification) {
                const info = err.response.data;
                const targetStep = !info.isEmailVerified ? "verify-email" : "phone";
                router.push(`/register?step=${targetStep}&userId=${info._id}&email=${encodeURIComponent(info.email)}&redirect=${encodeURIComponent(redirect)}`);
                return;
            }
            setError(err.response?.data?.message || "Something went wrong");
        } finally { setLoading(false); }
    };

    return (
        <div className="bg-cream min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 watercolor-bg">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <img src="/brand-hero.jpg" alt="An.n.Ash" className="w-24 h-24 mx-auto mb-6 object-contain rounded-xl opacity-90" />
                <h2 className="text-3xl font-serif text-foreground mb-1">Welcome Back</h2>
                <p className="text-foreground/50 text-sm tracking-wide">Sign in to your account</p>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="card-premium py-8 px-6 sm:px-10">
                    {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-5 text-sm border border-red-100">{error}</div>}
                    <form className="space-y-5" onSubmit={submitHandler}>
                        <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-1.5">Email address</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-elegant" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-1.5">Password</label>
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-elegant" placeholder="••••••••" />
                        </div>
                        <div className="pt-2">
                            <Button fullWidth type="submit" disabled={loading} size="lg">{loading ? "Signing in..." : "Sign In"}</Button>
                        </div>
                    </form>
                    <div className="mt-8 text-center">
                        <div className="gold-divider mb-5"><div className="gold-divider-gem" /></div>
                        <p className="text-sm text-foreground/60">New customer?{' '}<Link href={`/register?redirect=${redirect}`} className="font-medium text-gold hover:text-gold-dark transition-colors">Create an account</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
