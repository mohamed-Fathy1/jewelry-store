"use client";

import Image from "next/image";
import { colors } from "@/constants/colors";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useCart } from "@/contexts/CartContext";
import { color } from "framer-motion";

export default function OrderSummary() {
  const { shippingData, paymentData, selectedShipping } = useCheckout();
  const { cart } = useCart();

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = selectedShipping ? selectedShipping.cost : 15.0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  // Discount logic
  const itemCount = cart.items.reduce(
    (count, item) => count + item.quantity,
    0
  );
  let discount = 0;

  if (itemCount >= 3) {
    discount = total * 0.2; // 20% discount for 3 or more items
  } else if (total >= 500) {
    discount = total * 0.1; // 10% discount for total price of $500 or more
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
          <span style={{ color: colors.textPrimary }}>
            ${selectedShipping._id && selectedShipping.cost}
          </span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: colors.textSecondary }}>Tax</span>
          <span style={{ color: colors.textPrimary }}>${tax.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-shadow-light" style={{ color: colors.gold }}>
              Discount ({itemCount >= 3 ? "20%" : "10%"})
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
            <span
              style={{ textDecoration: discount > 0 ? "line-through" : "none" }}
            >
              ${total.toFixed(2)}
            </span>
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
