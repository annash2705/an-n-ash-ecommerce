"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    token: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        try {
            const storedUser = localStorage.getItem("userInfo");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            // localStorage unavailable
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback((userData: User) => {
        setUser(userData);
        try {
            localStorage.setItem("userInfo", JSON.stringify(userData));
        } catch (e) { }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        try {
            localStorage.removeItem("userInfo");
        } catch (e) { }
        router.push("/login");
    }, [router]);

    return (
        <AuthContext.Provider value={{ user: mounted ? user : null, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
