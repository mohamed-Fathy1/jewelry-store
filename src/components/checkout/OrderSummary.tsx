"use client";

import Image from "next/image";
import { colors } from "@/constants/colors";
import { useCart } from "@/contexts/CartContext";

export default function OrderSummary({ orderSummaryPreview, preview, previewLoading }) {
  const { cart } = useCart();

  const cartData = cart.items.length
    ? cart.items
    : orderSummaryPreview?.items ?? [];

  // Plain line-item sum — DISPLAY ONLY, shown until the backend preview arrives.
  // No offer/discount/free-shipping math happens here anymore: every total comes
  // from the backend `POST /order/preview` endpoint (the single source of truth).
  const lineItemsSubtotal = cartData.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const hasPreview = !!preview;
  const subtotal = hasPreview ? preview.subTotal : lineItemsSubtotal;
  const discount = hasPreview ? preview.discount : 0;
  const freeShipping = hasPreview ? preview.freeShipping : false;
  const shippingCost = hasPreview ? preview.shippingCost : null;
  const finalTotal = hasPreview ? preview.totalAmount : lineItemsSubtotal;
  const appliedOffer = preview?.appliedOffer ?? null;
  const flashOffers = preview?.flashSale?.offers ?? [];

  // Original total (before any saving) for the strike-through comparison.
  const originalTotal = subtotal + (shippingCost ?? 0);
  const hasSaving =
    hasPreview && (discount > 0 || freeShipping) && finalTotal < originalTotal;

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
                  EGP {(item.price * item.quantity).toFixed(2)}
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
            EGP {subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span style={{ color: colors.textSecondary }}>Shipping</span>
          <div>
            {!hasPreview ? (
              <span style={{ color: colors.textSecondary }}>
                {previewLoading ? "Calculating…" : "Calculated at checkout"}
              </span>
            ) : freeShipping ? (
              <>
                {shippingCost ? (
                  <span
                    style={{
                      color: colors.textPrimary,
                      textDecoration: "line-through",
                    }}
                  >
                    EGP {shippingCost.toFixed(2)}
                  </span>
                ) : null}
                <span
                  className="text-shadow-light"
                  style={{ color: colors.gold }}
                >
                  {" "}
                  Free
                </span>
              </>
            ) : (
              <span style={{ color: colors.textPrimary }}>
                EGP {(shippingCost ?? 0).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-shadow-light" style={{ color: colors.gold }}>
              Discount{appliedOffer?.title ? ` (${appliedOffer.title})` : ""}
            </span>
            <span className="text-shadow-light" style={{ color: colors.gold }}>
              -EGP {discount.toFixed(2)}
            </span>
          </div>
        )}

        {flashOffers.length > 0 && (
          <div className="flex justify-between">
            <span className="text-shadow-light" style={{ color: colors.gold }}>
              Flash sale
            </span>
            <span className="text-shadow-light" style={{ color: colors.gold }}>
              -EGP {(preview?.flashSale?.savedAmount ?? 0).toFixed(2)}
            </span>
          </div>
        )}

        <div
          className="flex justify-between pt-3 font-medium"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <span style={{ color: colors.textPrimary }}>Total</span>
          <span style={{ color: colors.textPrimary }}>
            {hasSaving ? (
              <span style={{ textDecoration: "line-through" }}>
                EGP {originalTotal.toFixed(2)}
              </span>
            ) : null}
            <span
              className={hasSaving ? "text-shadow-light" : ""}
              style={{
                marginLeft: "10px",
                color: hasSaving ? colors.gold : colors.textPrimary,
              }}
            >
              EGP {finalTotal.toFixed(2)}
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
