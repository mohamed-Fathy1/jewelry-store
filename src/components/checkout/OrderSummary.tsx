"use client";

import Image from "next/image";
import { colors } from "@/constants/colors";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState } from "react";

export default function OrderSummary() {
  const { shippingData, paymentData, selectedShipping } = useCheckout();
  const { cart } = useCart();
  const [isShippingFree, setIsShippingFree] = useState(false);

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = selectedShipping ? selectedShipping.cost : 0; // Default shipping cost
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  // New Discount Logic
  let discount = 0;

  useEffect(() => {
    if (
      cart.items.reduce((sum, item) => sum + item.quantity, 0) >= 3 ||
      total >= 1500
    ) {
      // Free shipping if 3 or more items
      setIsShippingFree(true);
    } else {
      setIsShippingFree(false);
    }
  }, [selectedShipping]);

  if (isShippingFree) {
    discount += shipping; // Remove shipping cost
  }

  if (total >= 1500) {
    discount += total * 0.1; // 10% discount for total price of 1500 EGP or more
  }

  const finalTotal = total - discount;

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
        {cart.items.map((item) => (
          <div key={item.productId} className="flex gap-4">
            <div className="w-20 h-20 flex-shrink-0">
              <Image
                src={item.productImage}
                alt={item.productName}
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
                {item.productName}
              </h3>
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

          <div>
            <span
              style={{
                color: colors.textPrimary,
                textDecoration:
                  isShippingFree && selectedShipping ? "line-through" : "",
              }}
            >
              {selectedShipping
                ? "$" + selectedShipping.cost
                : isShippingFree
                ? ""
                : "Select Shipping Method"}
            </span>
            {isShippingFree ? (
              <span
                className="text-shadow-light"
                style={{ color: colors.gold }}
              >
                {" "}
                Free
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex justify-between">
          <span style={{ color: colors.textSecondary }}>Tax</span>
          <span style={{ color: colors.textPrimary }}>${tax.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-shadow-light" style={{ color: colors.gold }}>
              Discount {total >= 1500 && "(10%)"}
            </span>
            <span className="text-shadow-light" style={{ color: colors.gold }}>
              -${discount.toFixed(2)}
            </span>
          </div>
        )}
        <div
          className="flex justify-between pt-3 font-medium"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <span style={{ color: colors.textPrimary }}>Total</span>
          <span style={{ color: colors.textPrimary }}>
            {discount > 0 ? (
              <span style={{ textDecoration: "line-through" }}>
                ${total.toFixed(2)}
              </span>
            ) : null}
            <span
              className={discount > 0 && "text-shadow-light"}
              style={{
                marginLeft: "10px",
                color: discount > 0 ? colors.gold : colors.textPrimary,
              }}
            >
              ${finalTotal.toFixed(2)}
            </span>
          </span>
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
