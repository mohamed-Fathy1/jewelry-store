"use client";

import Image from "next/image";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState } from "react";

export default function OrderSummary({ orderSummaryPreview }) {
  const { shippingData, paymentData, selectedShipping } = useCheckout();
  const { cart } = useCart();
  const [isShippingFree, setIsShippingFree] = useState(false);

  const cartData = cart.items.length ? cart.items : orderSummaryPreview.items;

  const subtotal = cartData.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = selectedShipping ? selectedShipping.cost : 0; // Default shipping cost
  const total = shipping && !isShippingFree ? subtotal + shipping : subtotal;

  // New Discount Logic
  let discount = 0;

  useEffect(() => {
    if (
      cartData.reduce((sum, item) => sum + item.quantity, 0) >= 3 ||
      total >= 1500
    ) {
      // Free shipping if 3 or more items
      setIsShippingFree(true);
    } else {
      setIsShippingFree(false);
    }
  }, [selectedShipping]);

  if (total >= 1500) {
    discount += total * 0.1; // 10% discount for total price of 1500 EGP or more
  }
  // if (isShippingFree) {
  //   discount += shipping; // Remove shipping cost
  // }

  const finalTotal = total - discount;

  return (
    <div className="rounded-lg p-6 bg-surface-muted">
      <h2 className="font-display text-lg mb-6 text-heading">Order Summary</h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cartData.map((item) => (
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
              <h3 className="text-sm font-medium text-ink">
                {item.productName}
              </h3>
              <div className="flex justify-between mt-1">
                <p className="text-sm text-ink-muted tabular-nums">
                  Qty: {item.quantity}
                </p>
                <p className="text-sm font-medium text-ink tabular-nums">
                  EGP {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 pt-6 border-t border-hairline">
        <div className="flex justify-between">
          <span className="text-ink-muted">Subtotal</span>
          <span className="text-ink tabular-nums">
            EGP {subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Shipping</span>

          <div>
            <span
              className={`text-ink tabular-nums ${
                isShippingFree && selectedShipping ? "line-through" : ""
              }`}
            >
              {selectedShipping
                ? "EGP" + selectedShipping.cost
                : isShippingFree
                ? ""
                : "Select Shipping Method"}
            </span>
            {isShippingFree ? (
              <span className="text-accent"> Free</span>
            ) : null}
          </div>
        </div>
        {/* <div className="flex justify-between">
          <span className="text-ink-muted">Tax</span>
          <span className="text-ink tabular-nums">EGP{tax.toFixed(2)}</span>
        </div> */}
        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-accent">
              Discount {total >= 1500 && "(10%)"}
            </span>
            <span className="text-accent tabular-nums">
              -EGP {discount.toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-between pt-3 font-medium border-t border-hairline">
          <span className="text-ink">Total</span>
          <span className="text-ink">
            {discount > 0 ? (
              <span className="line-through tabular-nums">
                EGP {(total + shipping).toFixed(2)}
              </span>
            ) : null}
            <span
              className={`ml-2.5 tabular-nums ${
                discount > 0 ? "text-accent" : "text-ink"
              }`}
            >
              EGP {finalTotal.toFixed(2)}
            </span>
          </span>
        </div>
      </div>

      {/* Secure Checkout Notice */}
      <div className="mt-6 p-4 rounded-md text-sm bg-accent-soft">
        <p className="text-ink-muted">
          Your order information is secure and encrypted. Pay only when your
          order arrives.
        </p>
      </div>
    </div>
  );
}
