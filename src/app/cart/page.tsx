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

export default function CartPage() {
  const { cart, setCart, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const [isCartQuantityChecked, setIsCartQuantityChecked] = useState(false);
  const { authUser } = useAuth();
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

    const [variantStock, productStock] = await Promise.all([
      variantIds.length
        ? cartService.checkVariantStock(variantIds)
        : Promise.resolve<Record<string, number>>({}),
      legacyProductIds.length
        ? cartService.checkStockAmount(legacyProductIds)
        : Promise.resolve<Record<string, number>>({}),
    ]);

    const updatedCart = cart.items.map((item) => {
      const availableQuantity = item.variantId
        ? variantStock[item.variantId]
        : productStock[item.productId];
      // Unknown (variant/product not returned) → leave the line untouched
      // rather than zeroing it on transient/missing data.
      if (availableQuantity == null) return item;
      if (item.quantity > availableQuantity) {
        // Show message to user
        toast(
          `The quantity for ${item.productName} has been updated to ${availableQuantity}.`,
          {
            icon: (
              <svg
                shape-rendering="geometricPrecision"
                text-rendering="geometricPrecision"
                image-rendering="optimizeQuality"
                fill="#0066b2"
                fill-rule="evenodd"
                clip-rule="evenodd"
                viewBox="0 0 512 512"
                className="w-6 h-6"
              >
                <path
                  fill-rule="nonzero"
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
          ...item,
          quantity: availableQuantity,
          availableItems: availableQuantity,
        }; // Update quantity
      } else if (item.availableItems !== availableQuantity) {
        return {
          ...item,
          availableItems: availableQuantity,
        };
      }
      return item; // No change
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
                {formatPrice(cart.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Shipping</span>
              <span className="text-ink">Calculated at checkout</span>
            </div>
          </div>

          <div className="border-t border-hairline pt-4 mt-4">
            <div className="flex justify-between mb-4">
              <span className="text-lg font-medium text-ink">Total</span>
              <span className="text-lg font-medium text-heading tabular-nums">
                {formatPrice(cart.totalAmount)}
              </span>
            </div>

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
