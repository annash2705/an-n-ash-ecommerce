"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";
import { Mail, Phone, Lock, User, Check, RefreshCw, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="bg-cream min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}

type Step = "details" | "verify-email" | "phone" | "verify-phone";

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, login } = useAuth();

    // Redirection and initial states from URL query parameters (for session resumption)
    const redirect = searchParams.get("redirect") || "/";
    const urlStep = (searchParams.get("step") as Step) || "details";
    const urlUserId = searchParams.get("userId") || "";
    const urlEmail = searchParams.get("email") || "";
    const urlPhone = searchParams.get("phone") || "";

    // Wizard States
    const [step, setStep] = useState<Step>(urlStep);
    const [userId, setUserId] = useState(urlUserId);
    const [email, setEmail] = useState(urlEmail);
    const [phone, setPhone] = useState(urlPhone);

    // Form inputs (Step 1)
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Verification code states (Step 2 & 4)
    const [emailCode, setEmailCode] = useState<string[]>(Array(6).fill(""));
    const [phoneCode, setPhoneCode] = useState<string[]>(Array(6).fill(""));

    // Phone Input state (Step 3)
    const [phoneInput, setPhoneInput] = useState(urlPhone);

    // Resend countdown states
    const [resendCooldown, setResendCooldown] = useState(0);

    // OTP capture for local testing helper
    const [receivedEmailOtp, setReceivedEmailOtp] = useState("");
    const [receivedPhoneOtp, setReceivedPhoneOtp] = useState("");

    // General UI states
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // OTP Input Refs
    const emailCodeRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    const phoneCodeRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    // Redirect to home if user is already logged in and verified
    useEffect(() => {
        if (user) {
            router.push(redirect);
        }
    }, [user, redirect, router]);

    // Synchronize local wizard states when query parameters change (e.g. from redirect loop login)
    useEffect(() => {
        if (urlStep) setStep(urlStep);
        if (urlUserId) setUserId(urlUserId);
        if (urlEmail) setEmail(urlEmail);
        if (urlPhone) {
            setPhone(urlPhone);
            setPhoneInput(urlPhone);
        }
    }, [urlStep, urlUserId, urlEmail, urlPhone]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => {
            setResendCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    // Update query parameters in the URL so that page refresh resumes current step
    const syncUrl = (nextStep: Step, nextUserId: string, nextEmail: string, nextPhone: string = "") => {
        const params = new URLSearchParams();
        params.set("step", nextStep);
        params.set("userId", nextUserId);
        params.set("email", nextEmail);
        if (nextPhone) params.set("phone", nextPhone);
        params.set("redirect", redirect);
        router.replace(`/register?${params.toString()}`);
    };

    // Step 1: Submit Details (Register)
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post("/users", { name, email, password });
            login(data);
            router.push(redirect);
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify Email OTP
    const handleVerifyEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const code = emailCode.join("");
        if (code.length !== 6) {
            setError("Please enter the full 6-digit verification code.");
            return;
        }
        setLoading(true);
        try {
            await api.post("/users/verify-email", { userId, code });
            setStep("phone");
            syncUrl("phone", userId, email);
            setEmailCode(Array(6).fill(""));
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid verification code.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2 Action: Resend Email OTP Code
    const handleResendEmailCode = async () => {
        if (resendCooldown > 0) return;
        setError("");
        setSuccessMessage("");
        try {
            const { data } = await api.post("/users/resend-email-code", { userId });
            if (data.code) {
                setReceivedEmailOtp(data.code);
            }
            setSuccessMessage("Verification code resent to your email.");
            setResendCooldown(30);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to resend code.");
        }
    };

    // Step 3: Collect Phone Number and Send OTP
    const handleSendPhoneOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        // Simple 10 digit Indian number pattern (allow 10 digits directly, prefix +91 backend-side or frontend)
        const rawPhone = phoneInput.trim().replace(/[^0-9]/g, "");
        if (rawPhone.length !== 10) {
            setError("Please enter a valid 10-digit phone number.");
            return;
        }
        setLoading(true);
        const fullPhoneNumber = `+91${rawPhone}`;
        try {
            const { data } = await api.post("/users/send-phone-otp", { userId, phone: fullPhoneNumber });
            setPhone(fullPhoneNumber);
            if (data.otp) {
                setReceivedPhoneOtp(data.otp);
            }
            setStep("verify-phone");
            syncUrl("verify-phone", userId, email, fullPhoneNumber);
            setSuccessMessage("Phone OTP sent successfully.");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to send phone OTP.");
        } finally {
            setLoading(false);
        }
    };

    // Step 4: Verify Phone OTP
    const handleVerifyPhone = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const code = phoneCode.join("");
        if (code.length !== 6) {
            setError("Please enter the 6-digit OTP.");
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post("/users/verify-phone", { userId, code });
            // Login the user & redirect
            login(data);
            router.push(redirect);
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid OTP code.");
        } finally {
            setLoading(false);
        }
    };

    // Step 4 Action: Resend Phone OTP
    const handleResendPhoneOtp = async () => {
        if (resendCooldown > 0) return;
        setError("");
        setSuccessMessage("");
        try {
            const { data } = await api.post("/users/send-phone-otp", { userId, phone });
            if (data.otp) {
                setReceivedPhoneOtp(data.otp);
            }
            setSuccessMessage("Phone OTP resent successfully.");
            setResendCooldown(30);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to resend phone OTP.");
        }
    };

    // Helper functions for digit input navigation
    const handleOtpChange = (
        element: HTMLInputElement,
        index: number,
        otpArray: string[],
        setOtpArray: (val: string[]) => void,
        refs: React.RefObject<HTMLInputElement | null>[]
    ) => {
        const value = element.value.replace(/[^0-9]/g, "");
        const newOtp = [...otpArray];

        if (!value) {
            newOtp[index] = "";
            setOtpArray(newOtp);
            return;
        }

        // Keep only last character
        newOtp[index] = value.substring(value.length - 1);
        setOtpArray(newOtp);

        // Auto-focus next input
        if (index < 5 && refs[index + 1].current) {
            refs[index + 1].current?.focus();
        }
    };

    const handleOtpKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number,
        otpArray: string[],
        setOtpArray: (val: string[]) => void,
        refs: React.RefObject<HTMLInputElement | null>[]
    ) => {
        if (e.key === "Backspace") {
            if (!otpArray[index] && index > 0 && refs[index - 1].current) {
                const newOtp = [...otpArray];
                newOtp[index - 1] = "";
                setOtpArray(newOtp);
                refs[index - 1].current?.focus();
            } else {
                const newOtp = [...otpArray];
                newOtp[index] = "";
                setOtpArray(newOtp);
            }
            e.preventDefault();
        }
    };

    const handleOtpPaste = (
        e: React.ClipboardEvent<HTMLInputElement>,
        setOtpArray: (val: string[]) => void,
        refs: React.RefObject<HTMLInputElement | null>[]
    ) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").substring(0, 6);
        if (pastedData.length === 6) {
            const newOtp = pastedData.split("");
            setOtpArray(newOtp);
            refs[5].current?.focus();
        }
    };

    // Step Progress indicators config
    const stepsList = [
        { id: "details", label: "Details" },
        { id: "verify-email", label: "Email" },
        { id: "phone", label: "Phone" },
        { id: "verify-phone", label: "Verify" }
    ];

    // Helper to render Step Progress dots
    const renderStepProgress = () => {
        const currentIdx = stepsList.findIndex(s => s.id === step);
        return (
            <div className="flex items-center justify-between mb-8 px-2">
                {stepsList.map((s, idx) => {
                    const isCompleted = idx < currentIdx;
                    const isActive = s.id === step;
                    return (
                        <div key={s.id} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border font-medium transition-all duration-300 ${
                                    isCompleted
                                        ? "bg-gold border-gold text-white"
                                        : isActive
                                        ? "border-gold text-gold bg-gold/5 ring-4 ring-gold/10"
                                        : "border-beige text-foreground/40 bg-ivory"
                                }`}>
                                    {isCompleted ? <Check className="w-4.5 h-4.5" /> : idx + 1}
                                </div>
                                <span className={`text-[10px] uppercase tracking-wider mt-1.5 font-medium ${
                                    isActive ? "text-gold font-semibold" : "text-foreground/40"
                                }`}>
                                    {s.label}
                                </span>
                            </div>
                            {idx < stepsList.length - 1 && (
                                <div className={`h-[1.5px] flex-1 mx-2 -mt-4 transition-all duration-500 ${
                                    idx < currentIdx ? "bg-gold" : "bg-beige"
                                }`} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-cream min-h-screen flex flex-col justify-center pt-28 pb-12 sm:px-6 lg:px-8 watercolor-bg">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <img src="/brand-hero.jpg" alt="An.n.Ash" className="w-24 h-24 mx-auto mb-6 object-contain rounded-xl opacity-90" />
                <h2 className="text-3xl font-serif text-foreground mb-1">Join An.n.Ash</h2>
                <p className="text-foreground/50 text-sm tracking-wide">Create your account</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="card-premium py-8 px-6 sm:px-10">
                    
                    {/* Feedback Banners */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-5 text-sm border border-red-100 flex items-start gap-2 animate-fade-in-up">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg mb-5 text-sm border border-emerald-100 flex items-start gap-2 animate-fade-in-up">
                            <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Step 1: Basic Details */}
                    {step === "details" && (
                        <form className="space-y-5 animate-fade-in-up" onSubmit={handleRegisterSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 w-4.5 h-4.5" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input-elegant !pl-10"
                                        placeholder="Your name"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Email address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 w-4.5 h-4.5" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-elegant !pl-10"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 w-4.5 h-4.5" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-elegant !pl-10"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground/80 mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 w-4.5 h-4.5" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input-elegant !pl-10"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <Button fullWidth type="submit" disabled={loading} size="lg">
                                    {loading ? "Creating..." : "Create Account"}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Email Verification */}
                    {step === "verify-email" && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-serif text-foreground">Verify Your Email</h3>
                                <p className="text-foreground/60 text-sm">
                                    We have sent a 6-digit verification code to <strong className="text-foreground">{email}</strong>.
                                </p>
                            </div>

                            {/* Local Testing Helper Alert Box */}
                            {receivedEmailOtp && (
                                <div className="bg-gold/10 border border-gold/30 rounded-lg p-3 text-sm text-gold-dark animate-fade-in-up flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold mb-0.5">Local Testing Helper</p>
                                        <p>The code is: <strong className="text-base tracking-wider font-bold">{receivedEmailOtp}</strong></p>
                                        <p className="text-[11px] text-gold-dark/70 mt-0.5">This alert is shown only during development/testing.</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleVerifyEmail} className="space-y-6">
                                <div className="flex justify-center gap-2.5">
                                    {emailCode.map((digit, idx) => (
                                        <input
                                            key={`email-digit-${idx}`}
                                            ref={emailCodeRefs[idx]}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(e.target, idx, emailCode, setEmailCode, emailCodeRefs)}
                                            onKeyDown={(e) => handleOtpKeyDown(e, idx, emailCode, setEmailCode, emailCodeRefs)}
                                            onPaste={(e) => handleOtpPaste(e, setEmailCode, emailCodeRefs)}
                                            className="w-11 h-13 border border-beige rounded-lg text-center text-lg font-semibold bg-ivory text-foreground focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all"
                                        />
                                    ))}
                                </div>

                                <div className="pt-2">
                                    <Button fullWidth type="submit" disabled={loading} size="lg">
                                        {loading ? "Verifying..." : "Verify Email"}
                                    </Button>
                                </div>
                            </form>

                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={handleResendEmailCode}
                                    disabled={resendCooldown > 0}
                                    className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                                        resendCooldown > 0
                                            ? "text-foreground/30 cursor-not-allowed"
                                            : "text-gold hover:text-gold-dark cursor-pointer"
                                    }`}
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? "animate-spin" : ""}`} />
                                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                                </button>
                            </div>

                            <div className="gold-divider mb-4">
                                <div className="gold-divider-gem" />
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("details");
                                        syncUrl("details", userId, email);
                                    }}
                                    className="inline-flex items-center gap-1 text-sm text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Back to details
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Collect Phone Number */}
                    {step === "phone" && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-serif text-foreground">Secure Your Account</h3>
                                <p className="text-foreground/60 text-sm">
                                    Please enter your 10-digit Indian mobile number to verify your identity.
                                </p>
                            </div>

                            <form onSubmit={handleSendPhoneOtp} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-foreground/80 mb-1.5">Phone Number</label>
                                    <div className="relative flex rounded-lg">
                                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-beige bg-beige/35 text-foreground/70 text-sm font-medium">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            required
                                            value={phoneInput}
                                            onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9]/g, "").substring(0, 10))}
                                            className="input-elegant rounded-l-none pl-3.5"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-foreground/40">An OTP will be sent to this number.</p>
                                </div>

                                <div className="pt-2">
                                    <Button fullWidth type="submit" disabled={loading} size="lg">
                                        {loading ? "Sending OTP..." : "Send OTP"}
                                    </Button>
                                </div>
                            </form>

                            <div className="gold-divider mb-4">
                                <div className="gold-divider-gem" />
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("verify-email");
                                        syncUrl("verify-email", userId, email);
                                    }}
                                    className="inline-flex items-center gap-1 text-sm text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Back to email step
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Phone Verification */}
                    {step === "verify-phone" && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-3">
                                    <KeyRound className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-serif text-foreground">Verify OTP</h3>
                                <p className="text-foreground/60 text-sm">
                                    We have sent a 6-digit OTP code to <strong className="text-foreground">{phone}</strong>.
                                </p>
                            </div>

                            {/* Local Testing Helper Alert Box */}
                            {receivedPhoneOtp && (
                                <div className="bg-gold/10 border border-gold/30 rounded-lg p-3 text-sm text-gold-dark animate-fade-in-up flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold mb-0.5">Local Testing Helper</p>
                                        <p>The code is: <strong className="text-base tracking-wider font-bold">{receivedPhoneOtp}</strong></p>
                                        <p className="text-[11px] text-gold-dark/70 mt-0.5">This alert is shown only during development/testing.</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleVerifyPhone} className="space-y-6">
                                <div className="flex justify-center gap-2.5">
                                    {phoneCode.map((digit, idx) => (
                                        <input
                                            key={`phone-digit-${idx}`}
                                            ref={phoneCodeRefs[idx]}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(e.target, idx, phoneCode, setPhoneCode, phoneCodeRefs)}
                                            onKeyDown={(e) => handleOtpKeyDown(e, idx, phoneCode, setPhoneCode, phoneCodeRefs)}
                                            onPaste={(e) => handleOtpPaste(e, setPhoneCode, phoneCodeRefs)}
                                            className="w-11 h-13 border border-beige rounded-lg text-center text-lg font-semibold bg-ivory text-foreground focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all"
                                        />
                                    ))}
                                </div>

                                <div className="pt-2">
                                    <Button fullWidth type="submit" disabled={loading} size="lg">
                                        {loading ? "Verifying..." : "Verify & Register"}
                                    </Button>
                                </div>
                            </form>

                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={handleResendPhoneOtp}
                                    disabled={resendCooldown > 0}
                                    className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                                        resendCooldown > 0
                                            ? "text-foreground/30 cursor-not-allowed"
                                            : "text-gold hover:text-gold-dark cursor-pointer"
                                    }`}
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? "animate-spin" : ""}`} />
                                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                                </button>
                            </div>

                            <div className="gold-divider mb-4">
                                <div className="gold-divider-gem" />
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("phone");
                                        syncUrl("phone", userId, email);
                                    }}
                                    className="inline-flex items-center gap-1 text-sm text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Change Phone Number
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Sign-in link (only visible on step 1) */}
                    {step === "details" && (
                        <div className="mt-8 text-center">
                            <div className="gold-divider mb-5">
                                <div className="gold-divider-gem" />
                            </div>
                            <p className="text-sm text-foreground/60">
                                Already have an account?{" "}
                                <Link
                                    href={`/login?redirect=${redirect}`}
                                    className="font-medium text-gold hover:text-gold-dark transition-colors"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
