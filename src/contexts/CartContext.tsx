"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Cart, CartItem, CartContextType } from "@/types/cart.types";
import toast from "react-hot-toast";
import { abort } from "process";

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

  // A cart line is identified by its variant (a specific colour+size); only
  // variant-less products fall back to the productId. This keeps two variants of
  // the same product as separate lines instead of colliding, and is the key
  // remove/updateQuantity operate on.
  const lineKey = (item: CartItem) => item.variantId ?? item.productId;

  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(
        (item) => lineKey(item) === lineKey(newItem)
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        const existing = prevCart.items[existingItemIndex];
        // Reject if the combined quantity would exceed this variant's stock.
        if (existing.quantity + newItem.quantity > newItem.availableItems) {
          toast.error("Item Out of Stock");
          return prevCart;
        }
        // Update quantity if the line exists
        updatedItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        // Add new line
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

  // `key` is a line key (variantId ?? productId), matching addToCart's identity.
  const removeFromCart = (key: string) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter(
        (item) => lineKey(item) !== key
      );
      const newTotal = calculateTotal(updatedItems);
      toast.success("Removed from cart");

      return {
        items: updatedItems,
        totalAmount: newTotal,
      };
    });
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(key);
      return;
    }

    setCart((prevCart) => {
      const updatedItems = prevCart.items.map((item) =>
        lineKey(item) === key ? { ...item, quantity } : item
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
    setCart,
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
