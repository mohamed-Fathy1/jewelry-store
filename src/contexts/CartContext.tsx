"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Cart, CartItem, CartContextType } from "@/types/cart.types";
import toast from "react-hot-toast";

const CART_STORAGE_KEY = "shopping_cart";

const initialCart: Cart = {
  items: [],
  totalAmount: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(initialCart);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(
        (item) => item.productId === newItem.productId
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        updatedItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        // Add new item
        updatedItems = [...prevCart.items, newItem];
      }

      const newTotal = calculateTotal(updatedItems);
      toast.success("Added to cart");

      return {
        items: updatedItems,
        totalAmount: newTotal,
      };
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter(
        (item) => item.productId !== productId
      );
      const newTotal = calculateTotal(updatedItems);
      toast.success("Removed from cart");

      return {
        items: updatedItems,
        totalAmount: newTotal,
      };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const updatedItems = prevCart.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      const newTotal = calculateTotal(updatedItems);

      return {
        items: updatedItems,
        totalAmount: newTotal,
      };
    });
  };

  const clearCart = () => {
    setCart(initialCart);
    localStorage.removeItem(CART_STORAGE_KEY);
    toast.success("Cart cleared");
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
