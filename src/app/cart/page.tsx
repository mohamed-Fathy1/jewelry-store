"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";

// Mock cart data - replace with actual cart state management
const initialCartItems = [
  {
    id: "1",
    name: "Diamond Pendant Necklace",
    price: 999.99,
    image: "/images/IMG_2953.JPG",
    quantity: 1,
    size: '18"',
  },
  {
    id: "2",
    name: "Gold Bracelet",
    price: 599.99,
    image: "/images/IMG_3176.PNG",
    quantity: 2,
    size: '7"',
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 15.0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1
        className="text-3xl font-light mb-8"
        style={{ color: colors.textPrimary }}
      >
        Shopping Cart
      </h1>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="space-y-8">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-6 pb-6"
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                >
                  <div className="w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3
                          className="text-lg font-medium"
                          style={{ color: colors.textPrimary }}
                        >
                          {item.name}
                        </h3>
                        <p
                          className="mt-1 text-sm"
                          style={{ color: colors.textSecondary }}
                        >
                          Size: {item.size}
                        </p>
                      </div>
                      <p
                        className="text-lg font-medium"
                        style={{ color: colors.textPrimary }}
                      >
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 rounded-md"
                          style={{
                            backgroundColor: colors.background,
                            color: colors.textPrimary,
                          }}
                        >
                          -
                        </button>
                        <span
                          className="w-8 text-center"
                          style={{ color: colors.textPrimary }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 rounded-md"
                          style={{
                            backgroundColor: colors.background,
                            color: colors.textPrimary,
                          }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm flex items-center gap-1"
                        style={{ color: colors.textSecondary }}
                      >
                        <TrashIcon className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div
              className="rounded-lg p-6"
              style={{ backgroundColor: colors.background }}
            >
              <h2
                className="text-lg font-medium mb-4"
                style={{ color: colors.textPrimary }}
              >
                Order Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Subtotal</span>
                  <span style={{ color: colors.textPrimary }}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Shipping</span>
                  <span style={{ color: colors.textPrimary }}>
                    ${shipping.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Tax</span>
                  <span style={{ color: colors.textPrimary }}>
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div
                  className="pt-4 flex justify-between font-medium"
                  style={{ borderTop: `1px solid ${colors.border}` }}
                >
                  <span style={{ color: colors.textPrimary }}>Total</span>
                  <span style={{ color: colors.textPrimary }}>
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-6 block w-full py-3 px-4 rounded-md text-center transition-colors duration-200"
                style={{
                  backgroundColor: colors.brown,
                  color: colors.textLight,
                }}
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="text-center py-12"
          style={{ color: colors.textSecondary }}
        >
          <p className="mb-4">Your cart is empty</p>
          <Link
            href="/shop"
            className="inline-block py-2 px-4 rounded-md transition-colors duration-200"
            style={{
              backgroundColor: colors.brown,
              color: colors.textLight,
            }}
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
