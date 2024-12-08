"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import toast from "react-hot-toast";

// Mock wishlist data - replace with actual state management
const initialWishlistItems = [
  {
    id: "1",
    name: "Diamond Pendant Necklace",
    price: 999.99,
    image: "/images/IMG_2953.JPG",
    category: "Necklaces",
    inStock: true,
  },
  {
    id: "2",
    name: "Gold Bracelet",
    price: 599.99,
    image: "/images/IMG_3176.PNG",
    category: "Bracelets",
    inStock: false,
  },
];

export default function AccountWishlist() {
  const [wishlistItems, setWishlistItems] = useState(initialWishlistItems);

  const removeFromWishlist = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removed from wishlist");
  };

  const addToCart = (name: string) => {
    toast.success(`${name} added to cart`);
  };

  return (
    <div className="space-y-6">
      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg overflow-hidden"
              style={{ backgroundColor: colors.background }}
            >
              <div className="aspect-square relative">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                {!item.inStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <span
                      className="px-4 py-2 rounded-md text-sm font-medium"
                      style={{ color: colors.textLight }}
                    >
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <Link href={`/product/${item.id}`}>
                  <h3
                    className="text-lg font-medium mb-1"
                    style={{ color: colors.textPrimary }}
                  >
                    {item.name}
                  </h3>
                </Link>
                <p className="mb-2" style={{ color: colors.textSecondary }}>
                  {item.category}
                </p>
                <p
                  className="text-lg font-semibold mb-4"
                  style={{ color: colors.textPrimary }}
                >
                  ${item.price}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => addToCart(item.name)}
                    disabled={!item.inStock}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors duration-200 disabled:opacity-50"
                    style={{
                      backgroundColor: colors.brown,
                      color: colors.textLight,
                    }}
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="p-2 rounded-md border transition-colors duration-200"
                    style={{
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    }}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="text-center py-12"
          style={{ color: colors.textSecondary }}
        >
          <p className="mb-4">Your wishlist is empty</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2 rounded-md transition-colors duration-200"
            style={{
              backgroundColor: colors.brown,
              color: colors.textLight,
            }}
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
