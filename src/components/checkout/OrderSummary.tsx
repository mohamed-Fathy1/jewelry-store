"use client";

import SmartImage from "@/components/ui/SmartImage";
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

  // Live per-line prices keyed by variant. The cart only holds a price *snapshot*
  // taken when the item was added, which goes stale the moment a product's sale
  // price (finalPrice) changes. The backend preview always reflects the current
  // price, so we prefer it for the displayed row price — this is what keeps the
  // rows reconciling with the Subtotal (the backend's source of truth).
  const livePriceByKey = new Map<string, any>(
    (preview?.items ?? []).map((it: any) => [
      String(it.variantId ?? it.productId),
      it,
    ])
  );
  const lineUnitPrice = (item) => {
    const live = livePriceByKey.get(String(item.variantId ?? item.productId));
    return live?.listedUnitPrice ?? item.price;
  };

  // Plain line-item sum — DISPLAY ONLY, shown until the backend preview arrives.
  // No offer/discount/free-shipping math happens here anymore: every total comes
  // from the backend `POST /order/preview` endpoint (the single source of truth).
  const lineItemsSubtotal = cartData.reduce(
    (sum, item) => sum + lineUnitPrice(item) * item.quantity,
    0
  );

  const round2 = (n: number) => Math.round(n * 100) / 100;

  const hasPreview = !!preview;
  const flashSaved = preview?.flashSale?.savedAmount ?? 0;
  const discount = hasPreview ? preview.discount ?? 0 : 0;
  const freeShipping = hasPreview ? preview.freeShipping : false;
  const shippingCost = hasPreview ? preview.shippingCost ?? 0 : null;
  const finalTotal = hasPreview ? preview.totalAmount : lineItemsSubtotal;
  const appliedOffer = preview?.appliedOffer ?? null;
  const flashOffers = preview?.flashSale?.offers ?? [];

  // The backend `subTotal` is already flash-discounted, and
  // total = subTotal − discount + shipping. Add the flash savings back so the
  // "Flash sale" and "Discount" deduction lines reconcile to the Total (and
  // match the listed item prices, which are pre-flash).
  const subtotal = hasPreview
    ? round2(preview.subTotal + flashSaved)
    : lineItemsSubtotal;
  // Original total (no offers, full shipping) for the strike-through comparison.
  const originalTotal = round2(subtotal + (shippingCost ?? 0));
  const totalSaved = hasPreview ? round2(originalTotal - finalTotal) : 0;
  const hasSaving = totalSaved > 0;

  return (
    <div className="rounded-lg p-6 bg-surface-muted">
      <h2 className="font-display text-lg mb-6 text-heading">Order Summary</h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cartData.map((item) => (
          <div key={item.variantId ?? item.productId} className="flex gap-4">
            <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-md bg-surface-muted">
              <SmartImage
                src={item.productImage}
                alt={item.productName}
                fill
                sizes="80px"
                className="object-cover"
                fallbackLabel={item.productName?.charAt(0)}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-ink">
                {item.productName}
              </h3>
              {(item.colorName || item.sizeNumber) && (
                <p className="mt-0.5 text-xs text-ink-muted">
                  {[item.colorName, item.sizeNumber && `Size ${item.sizeNumber}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              <div className="flex justify-between mt-1">
                <p className="text-sm text-ink-muted tabular-nums">
                  Qty: {item.quantity}
                </p>
                <p className="text-sm font-medium text-ink tabular-nums">
                  EGP {(lineUnitPrice(item) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown — lines reconcile to Total: subtotal − flash − discount + shipping */}
      <div className="space-y-3 pt-6 border-t border-hairline">
        <div className="flex justify-between">
          <span className="text-ink-muted">Subtotal</span>
          <span className="text-ink tabular-nums">
            EGP {subtotal.toFixed(2)}
          </span>
        </div>

        {flashSaved > 0 && (
          <div className="flex justify-between">
            <span className="text-accent">
              Flash sale
              {flashOffers[0]?.title ? ` · ${flashOffers[0].title}` : ""}
            </span>
            <span className="text-accent tabular-nums">
              −EGP {flashSaved.toFixed(2)}
            </span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-accent">
              Discount{appliedOffer?.title ? ` · ${appliedOffer.title}` : ""}
            </span>
            <span className="text-accent tabular-nums">
              −EGP {discount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-ink-muted">Shipping</span>
          <div className="text-right">
            {!hasPreview ? (
              <span className="text-ink-muted">
                {previewLoading ? "Calculating…" : "Calculated at checkout"}
              </span>
            ) : freeShipping ? (
              <>
                {shippingCost ? (
                  <span className="mr-2 text-ink-muted tabular-nums line-through">
                    EGP {shippingCost.toFixed(2)}
                  </span>
                ) : null}
                <span className="text-accent">Free</span>
              </>
            ) : (
              <span className="text-ink tabular-nums">
                EGP {(shippingCost ?? 0).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-baseline justify-between pt-3 font-medium border-t border-hairline">
          <span className="text-ink">Total</span>
          {!hasPreview ? (
            // Until the backend preview resolves we don't know shipping/discount,
            // so show a pending state rather than a bare subtotal that would
            // understate what the customer is charged.
            <span className="text-sm font-normal text-ink-muted">
              {previewLoading ? "Calculating…" : "Calculated at checkout"}
            </span>
          ) : (
            <span className="flex items-baseline gap-2.5">
              {hasSaving ? (
                <span className="text-sm text-ink-muted line-through tabular-nums">
                  EGP {originalTotal.toFixed(2)}
                </span>
              ) : null}
              <span
                className={`tabular-nums ${
                  hasSaving ? "text-accent" : "text-ink"
                }`}
              >
                EGP {finalTotal.toFixed(2)}
              </span>
            </span>
          )}
        </div>

        {hasSaving && (
          <p className="text-right text-sm text-accent">
            You saved EGP {totalSaved.toFixed(2)}
          </p>
        )}
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
