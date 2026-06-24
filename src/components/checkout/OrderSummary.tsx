"use client";

import Image from "next/image";
import { useCart } from "@/contexts/CartContext";

export default function OrderSummary({
  orderSummaryPreview,
  preview,
  previewLoading,
}) {
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
            {!hasPreview ? (
              <span className="text-ink-muted">
                {previewLoading ? "Calculating…" : "Calculated at checkout"}
              </span>
            ) : freeShipping ? (
              <>
                {shippingCost ? (
                  <span className="text-ink tabular-nums line-through">
                    EGP {shippingCost.toFixed(2)}
                  </span>
                ) : null}
                <span className="text-accent"> Free</span>
              </>
            ) : (
              <span className="text-ink tabular-nums">
                EGP {(shippingCost ?? 0).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-accent">
              Discount{appliedOffer?.title ? ` (${appliedOffer.title})` : ""}
            </span>
            <span className="text-accent tabular-nums">
              -EGP {discount.toFixed(2)}
            </span>
          </div>
        )}

        {flashOffers.length > 0 && (
          <div className="flex justify-between">
            <span className="text-accent">Flash sale</span>
            <span className="text-accent tabular-nums">
              -EGP {(preview?.flashSale?.savedAmount ?? 0).toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between pt-3 font-medium border-t border-hairline">
          <span className="text-ink">Total</span>
          <span className="text-ink">
            {hasSaving ? (
              <span className="line-through tabular-nums">
                EGP {originalTotal.toFixed(2)}
              </span>
            ) : null}
            <span
              className={`ml-2.5 tabular-nums ${
                hasSaving ? "text-accent" : "text-ink"
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
