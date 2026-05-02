"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface CartItem {
    product: string;
    name: string;
    image: string;
    price: number;
    qty: number;
    countInStock?: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    cartTotal: number;
}

const CartContext = createContext<CartContextType>({
    cartItems: [],
    addToCart: () => { },
    removeFromCart: () => { },
    clearCart: () => { },
    cartTotal: 0,
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        try {
            const storedCart = localStorage.getItem("cartItems");
            if (storedCart) {
                setCartItems(JSON.parse(storedCart));
            }
        } catch (e) {
            // localStorage unavailable
        }
    }, []);

    const addToCart = useCallback((item: CartItem) => {
        setCartItems((prev) => {
            const existItemStr = prev.find((x) => x.product === item.product);
            let updatedCart;
            if (existItemStr) {
                updatedCart = prev.map((x) =>
                    x.product === existItemStr.product ? item : x
                );
            } else {
                updatedCart = [...prev, item];
            }
            try { localStorage.setItem("cartItems", JSON.stringify(updatedCart)); } catch (e) { }
            return updatedCart;
        });
    }, []);

    const removeFromCart = useCallback((id: string) => {
        setCartItems((prev) => {
            const updatedCart = prev.filter((x) => x.product !== id);
            try { localStorage.setItem("cartItems", JSON.stringify(updatedCart)); } catch (e) { }
            return updatedCart;
        });
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
        try { localStorage.removeItem("cartItems"); } catch (e) { }
    }, []);

    const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    return (
        <CartContext.Provider
            value={{ cartItems, addToCart, removeFromCart, clearCart, cartTotal }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
