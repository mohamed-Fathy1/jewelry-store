"use client";

import { useCart } from "@/contexts/CartContext";
import SmartImage from "@/components/ui/SmartImage";
import Link from "next/link";
import {
  MinusIcon,
  PlusIcon,
  XMarkIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { formatPrice } from "@/utils/format";
import { useEffect, useState } from "react";
import { cartService } from "@/services/cart.service";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { analytics } from "@/lib";
import { BoltIcon, TruckIcon } from "@heroicons/react/24/solid";
import type { CartPreview } from "@/types/cart.types";

export default function CartPage() {
  const { cart, setCart, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const [isCartQuantityChecked, setIsCartQuantityChecked] = useState(false);
  const [viewCartTracked, setViewCartTracked] = useState(false);
  const { authUser } = useAuth();
  // Live offer/flash pricing for the cart, computed server-side (same engine as
  // checkout). Shipping resolves at checkout, so this is a merchandise estimate.
  const [preview, setPreview] = useState<CartPreview | null>(null);
  // Reconcile cart quantities against live stock. Stock is tracked per VARIANT
  // (a specific colour+size), so each line is checked against its own variant;
  // legacy variant-less items fall back to the product-level total.
  const checkAvailableStock = async () => {
    const variantIds = cart.items
      .map((item) => item.variantId)
      .filter((id): id is string => Boolean(id));
    const legacyProductIds = cart.items
      .filter((item) => !item.variantId)
      .map((item) => item.productId);

    type LiveInfo = { availableItems: number; finalPrice: number | null };
    let variantInfo: Record<string, LiveInfo> = {};
    let productInfo: Record<string, LiveInfo> = {};
    try {
      [variantInfo, productInfo] = await Promise.all([
        variantIds.length
          ? cartService.checkVariantStock(variantIds)
          : Promise.resolve<Record<string, LiveInfo>>({}),
        legacyProductIds.length
          ? cartService.checkStockAmount(legacyProductIds)
          : Promise.resolve<Record<string, LiveInfo>>({}),
      ]);
    } catch (error) {
      // Stock reconciliation is best-effort: a failed/unauthorized check must
      // never crash the cart. Leave quantities as-is; the order endpoint is the
      // final stock authority at checkout.
      console.warn("Stock availability check failed:", error);
      return;
    }

    const updatedCart = cart.items.map((item) => {
      const info = item.variantId
        ? variantInfo[item.variantId]
        : productInfo[item.productId];
      // Unknown (variant/product not returned) → leave the line untouched
      // rather than zeroing it on transient/missing data.
      if (info == null) return item;
      const availableQuantity = info.availableItems;
      // The cart stores a price snapshot from add-time, which goes stale when a
      // sale starts/ends. Refresh it to the live price so the displayed rows and
      // total match what checkout/preview will actually charge.
      const priced =
        typeof info.finalPrice === "number" && info.finalPrice !== item.price
          ? { ...item, price: info.finalPrice }
          : item;
      if (item.quantity > availableQuantity) {
        // Show message to user
        toast(
          `The quantity for ${item.productName} has been updated to ${availableQuantity}.`,
          {
            icon: (
              <svg
                shapeRendering="geometricPrecision"
                textRendering="geometricPrecision"
                imageRendering="optimizeQuality"
                fill="#0066b2"
                fillRule="evenodd"
                clipRule="evenodd"
                viewBox="0 0 512 512"
                className="w-6 h-6"
              >
                <path
                  fillRule="nonzero"
                  d="M256 0c70.686 0 134.69 28.658 181.016 74.984C483.342 121.31 512 185.314 512 256c0 70.686-28.658 134.69-74.984 181.016C390.69 483.342 326.686 512 256 512c-70.686 0-134.69-28.658-181.016-74.984C28.658 390.69 0 326.686 0 256c0-70.686 28.658-134.69 74.984-181.016C121.31 28.658 185.314 0 256 0z"
                />
                <path
                  fill="#fff"
                  d="M256 29.464c125.114 0 226.536 101.422 226.536 226.536S381.114 482.536 256 482.536 29.464 381.114 29.464 256 130.886 29.464 256 29.464z"
                />
                <path d="M256 341.492c14.453 0 26.168 11.717 26.168 26.171 0 14.453-11.715 26.167-26.168 26.167s-26.171-11.714-26.171-26.167c0-14.454 11.718-26.171 26.171-26.171zm19.55-39.211c-.88 22.063-38.246 22.092-39.1-.007-3.778-37.804-13.443-127.553-13.135-163.074.311-10.946 9.383-17.426 20.989-19.898 3.578-.765 7.513-1.136 11.477-1.132 3.986.007 7.932.4 11.514 1.165 11.988 2.554 21.401 9.301 21.398 20.444l-.045 1.117-13.098 161.385z" />
              </svg>
            ),
          }
        ); // Assuming item has a 'name'
        return {
          ...priced,
          quantity: availableQuantity,
          availableItems: availableQuantity,
        }; // Update quantity (+ refreshed price)
      } else if (item.availableItems !== availableQuantity) {
        return {
          ...priced,
          availableItems: availableQuantity,
        };
      }
      return priced; // price refreshed (quantity unchanged)
    });

    // Update cart with new quantities
    setCart((prev) => {
      return {
        ...prev,
        items: updatedCart.filter((item) => item.quantity > 0),
        totalAmount: updatedCart.reduce(
          (total, item) => total + (item.price || 0) * item.quantity,
          0
        ),
      };
    });
  };

  // Call the function when the component mounts
  useEffect(() => {
    if ((cart && cart?.totalAmount === 0) || isCartQuantityChecked) return;
    setIsCartQuantityChecked(true);
    checkAvailableStock();
  }, [cart]); // Dependency on cart to check whenever it changes

  // Fetch live offer/flash pricing whenever the cart contents change. Keyed on
  // each line's id + quantity so it refreshes on add/remove/quantity changes.
  const previewKey = cart.items
    .map((item) => `${item.variantId ?? item.productId}:${item.quantity}`)
    .join("|");
  useEffect(() => {
    if (!cart.items.length) {
      setPreview(null);
      return;
    }
    let active = true;
    (async () => {
      const result = await cartService.previewCart(
        cart.items.map((item) =>
          item.variantId
            ? { variantId: item.variantId, quantity: item.quantity }
            : { productId: item.productId, quantity: item.quantity }
        )
      );
      if (active) setPreview(result);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey]);

  // GA4 / Pixel view_cart — fire once the cart page has items.
  useEffect(() => {
    if (viewCartTracked || !cart.items.length) return;
    setViewCartTracked(true);
    analytics.trackViewCart({
      contents: cart.items.map((item) => ({
        id: item.variantId ?? item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      numItems: cart.items.reduce((n, item) => n + item.quantity, 0),
      value: cart.totalAmount,
      currency: "EGP",
    });
  }, [cart, viewCartTracked]);

  // Summary figures: prefer the server preview (live offers/flash); fall back to
  // the cart's snapshot totals if the preview is unavailable (e.g. offline).
  const listedSubtotal = preview
    ? preview.items.reduce((sum, i) => sum + i.listedLineTotal, 0)
    : cart.totalAmount;
  const flashSaved = preview?.flashSale.savedAmount ?? 0;
  const offerDiscount = preview?.discount ?? 0;
  const offerTitle = preview?.appliedOffer?.title;
  const freeShipping = preview?.freeShipping ?? false;
  const merchandiseTotal = preview?.merchandiseTotal ?? cart.totalAmount;

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-20 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-surface-muted text-ink-muted">
          <ShoppingBagIcon className="h-9 w-9" aria-hidden="true" />
        </div>
        <h1 className="mt-8 font-display text-3xl text-heading">
          Your cart is empty
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">
          Nothing here yet. Browse the collection and add the pieces you love.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-primary px-8 py-3 text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-3xl mb-8 text-heading">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const lineKey = item.variantId ?? item.productId;
            return (
            <div
              key={lineKey}
              className="flex items-center justify-between space-x-2 md:space-x-4 p-3 md:p-4 rounded-lg border border-hairline bg-surface"
            >
              <Link
                href={`/product/${item.productId}`}
                className="flex gap-3 md:gap-5 items-center group"
              >
                <div className="w-20 h-20 shrink-0 md:w-24 md:h-24 relative rounded-md overflow-hidden bg-surface-muted">
                  <SmartImage
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    sizes="96px"
                    className="object-cover"
                    fallbackLabel={item.productName?.charAt(0)}
                  />
                </div>

                <div className="flex-grow">
                  <h3 className="text-sm md:text-lg font-medium group-hover:underline text-ink">
                    {item.productName}
                  </h3>
                  {(item.colorName || item.sizeNumber) && (
                    <p className="text-xs text-ink-muted">
                      {[item.colorName, item.sizeNumber && `Size ${item.sizeNumber}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  <p className="text-sm md:text-lg font-semibold text-heading tabular-nums">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </Link>

              <div className="flex items-center space-x-2">
                <div className="flex items-center border border-hairline rounded-md">
                  <button
                    onClick={() =>
                      updateQuantity(lineKey, item.quantity - 1)
                    }
                    aria-label={`Decrease quantity of ${item.productName}`}
                    className="p-2 transition-colors text-ink hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="px-3 md:px-4 py-1 border-x border-hairline text-ink tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(lineKey, item.quantity + 1)
                    }
                    aria-label={`Increase quantity of ${item.productName}`}
                    className="p-2 transition-colors text-ink hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={item.quantity >= item.availableItems}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(lineKey)}
                  aria-label={`Remove ${item.productName} from cart`}
                  className="md:p-2 rounded-md transition-colors text-ink-muted hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            );
          })}

          <button
            onClick={clearCart}
            className="text-sm transition-colors hover:underline text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Clear Cart
          </button>
        </div>

        <div className="lg:col-span-1 p-6 rounded-lg space-y-4 bg-surface-muted">
          <h2 className="font-display text-xl text-heading">Order Summary</h2>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-ink-muted">Subtotal</span>
              <span className="text-ink tabular-nums">
                {formatPrice(listedSubtotal)}
              </span>
            </div>

            {flashSaved > 0 && (
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5 text-primary">
                  <BoltIcon className="h-4 w-4" aria-hidden="true" />
                  Flash sale
                </span>
                <span className="text-primary tabular-nums">
                  &minus;{formatPrice(flashSaved)}
                </span>
              </div>
            )}

            {offerDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-primary">
                  Offer{offerTitle ? ` · ${offerTitle}` : ""}
                </span>
                <span className="text-primary tabular-nums">
                  &minus;{formatPrice(offerDiscount)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-ink-muted">Shipping</span>
              {freeShipping ? (
                <span className="flex items-center gap-1.5 font-medium text-primary">
                  <TruckIcon className="h-4 w-4" aria-hidden="true" />
                  Free
                </span>
              ) : (
                <span className="text-ink">Calculated at checkout</span>
              )}
            </div>
          </div>

          <div className="border-t border-hairline pt-4 mt-4">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-lg font-medium text-ink">
                Total{" "}
                <span className="text-xs font-normal text-ink-muted">
                  (excl. shipping)
                </span>
              </span>
              <span className="text-lg font-medium text-heading tabular-nums">
                {formatPrice(merchandiseTotal)}
              </span>
            </div>
            <p className="mb-4 text-xs text-ink-muted">
              {freeShipping
                ? "Free shipping applied. Final total confirmed at checkout."
                : "Shipping and any final adjustments are calculated at checkout."}
            </p>

            <Link
              href={
                authUser
                  ? "/checkout?step=shipping"
                  : `/auth/login?returnUrl=${encodeURIComponent(
                      "/checkout?step=shipping"
                    )}`
              }
              className="w-full block text-center py-3 px-4 rounded-full bg-primary text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
