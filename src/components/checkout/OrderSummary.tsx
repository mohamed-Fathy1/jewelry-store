"use client";

import Image from "next/image";
import { colors } from "@/constants/colors";

// Mock cart data - replace with actual cart state management
const cartItems = [
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

export default function OrderSummary() {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 15.0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  return (
    <div
      className="rounded-lg p-6"
      style={{ backgroundColor: colors.background }}
    >
      <h2
        className="text-lg font-medium mb-6"
        style={{ color: colors.textPrimary }}
      >
        Order Summary
      </h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="w-20 h-20 flex-shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={80}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="flex-1">
              <h3
                className="text-sm font-medium"
                style={{ color: colors.textPrimary }}
              >
                {item.name}
              </h3>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Size: {item.size}
              </p>
              <div className="flex justify-between mt-1">
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Qty: {item.quantity}
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div
        className="space-y-3 pt-6"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
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
          <span style={{ color: colors.textPrimary }}>${tax.toFixed(2)}</span>
        </div>
        <div
          className="flex justify-between pt-3 font-medium"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <span style={{ color: colors.textPrimary }}>Total</span>
          <span style={{ color: colors.textPrimary }}>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Secure Checkout Notice */}
      <div
        className="mt-6 p-4 rounded-md text-sm"
        style={{ backgroundColor: colors.accentLight }}
      >
        <p style={{ color: colors.textSecondary }}>
          Your order information is secure and encrypted. Pay only when your
          order arrives.
        </p>
      </div>
    </div>
  );
}
