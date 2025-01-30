"use client";

import { useCart } from "@/contexts/CartContext";
import { colors } from "@/constants/colors";
import Image from "next/image";
import Link from "next/link";
import { MinusIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1
          className="text-3xl font-light mb-8"
          style={{ color: colors.textPrimary }}
        >
          Your Cart is Empty
        </h1>
        <Link
          href="/shop"
          className="inline-block px-8 py-3 rounded-md transition-colors duration-200"
          style={{ backgroundColor: colors.brown, color: colors.textLight }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1
        className="text-3xl font-light mb-8"
        style={{ color: colors.textPrimary }}
      >
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center space-x-4 p-4 rounded-lg border"
              style={{ borderColor: colors.border }}
            >
              <div className="w-24 h-24 relative rounded-md overflow-hidden">
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-grow">
                <h3
                  className="text-lg font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  {item.productName}
                </h3>
                <p
                  className="text-lg font-semibold"
                  style={{ color: colors.brown }}
                >
                  {formatPrice(item.price)}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div
                  className="flex items-center border rounded-md"
                  style={{ borderColor: colors.border }}
                >
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="p-2 transition-colors hover:bg-gray-100"
                    style={{ color: colors.textPrimary }}
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span
                    className="px-4 py-1 border-x"
                    style={{ borderColor: colors.border }}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="p-2 transition-colors hover:bg-gray-100"
                    style={{ color: colors.textPrimary }}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-2 rounded-md transition-colors hover:bg-gray-100"
                  style={{ color: colors.textSecondary }}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm transition-colors hover:underline"
            style={{ color: colors.textSecondary }}
          >
            Clear Cart
          </button>
        </div>

        <div
          className="lg:col-span-1 p-6 rounded-lg space-y-4"
          style={{ backgroundColor: colors.background }}
        >
          <h2
            className="text-xl font-medium"
            style={{ color: colors.textPrimary }}
          >
            Order Summary
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>Subtotal</span>
              <span style={{ color: colors.textPrimary }}>
                {formatPrice(cart.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>Shipping</span>
              <span style={{ color: colors.textPrimary }}>
                Calculated at checkout
              </span>
            </div>
          </div>

          <div
            className="border-t pt-4 mt-4"
            style={{ borderColor: colors.border }}
          >
            <div className="flex justify-between mb-4">
              <span
                className="text-lg font-medium"
                style={{ color: colors.textPrimary }}
              >
                Total
              </span>
              <span
                className="text-lg font-medium"
                style={{ color: colors.brown }}
              >
                {formatPrice(cart.totalAmount)}
              </span>
            </div>

            <Link
              href="/checkout"
              className="w-full block text-center py-3 px-4 rounded-md transition-colors duration-200"
              style={{ backgroundColor: colors.brown, color: colors.textLight }}
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
