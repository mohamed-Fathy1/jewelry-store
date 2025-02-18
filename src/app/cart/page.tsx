"use client";

import { useCart } from "@/contexts/CartContext";
import { colors } from "@/constants/colors";
import Image from "next/image";
import Link from "next/link";
import { MinusIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "@/utils/format";
import { useEffect, useState } from "react";
import { cartService } from "@/services/cart.service";
import toast from "react-hot-toast";

export default function CartPage() {
  const { cart, setCart, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const [isCartQuantityChecked, setIsCartQuantityChecked] = useState(false);

  // New function to check available stock
  const checkAvailableStock = async () => {
    const productIds = cart.items.map((item) => item.productId); // Assuming each cart item has an 'id'
    console.log(productIds);

    const availableItems = await cartService.checkStockAmount(productIds);
    const updatedCart = cart.items.map((item) => {
      const availableQuantity = availableItems[item.productId]; // Default to current quantity if not found
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
              className="flex items-center justify-between space-x-2 md:space-x-4 p-3 md:p-4 rounded-lg border"
              style={{ borderColor: colors.border }}
            >
              <Link
                href={`/product/${item.productId}`}
                className="flex gap-3 md:gap-5 items-center group"
              >
                <div className="w-20 h-20 shrink-0 md:w-24 md:h-24 relative rounded-md overflow-hidden">
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-grow">
                  <h3
                    className="text-sm md:text-lg font-medium group-hover:underline"
                    style={{ color: colors.textPrimary }}
                  >
                    {item.productName}
                  </h3>
                  <p
                    className="text-sm md:text-lg font-semibold"
                    style={{ color: colors.brown }}
                  >
                    {formatPrice(item.price)}
                  </p>
                </div>
              </Link>

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
                    className="px-3 md:px-4 py-1 border-x"
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
                    disabled={item.quantity >= item.availableItems}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="md:p-2 rounded-md transition-colors hover:bg-gray-100"
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
