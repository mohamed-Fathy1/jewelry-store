"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { colors } from "@/constants/colors";

// This would typically come from an API
const products: Product[] = [
  {
    id: "1",
    name: "Diamond Pendant Necklace",
    description: "Elegant diamond pendant in 18k gold",
    price: 999.99,
    images: ["/images/IMG_2953.JPG"],
    category: "Necklaces",
    material: "Gold",
    rating: 4.5,
    reviews: 12,
    inStock: true,
  },
  {
    id: "2",
    name: "Sapphire Ring",
    description: "Beautiful sapphire ring with diamond accents",
    price: 1499.99,
    images: ["/images/IMG_1853.JPG"],
    category: "Rings",
    material: "Platinum",
    rating: 4.8,
    reviews: 8,
    inStock: true,
  },
  // Add more products...
];

export default function ProductGrid() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
    toast.success("Wishlist updated");
  };

  const addToCart = (productName: string) => {
    toast.success(`${productName} added to cart`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="group relative">
          <div
            className="aspect-square rounded-lg overflow-hidden"
            style={{ backgroundColor: colors.background }}
          >
            <Image
              src={product.images[0]}
              alt={product.name}
              width={500}
              height={500}
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-4 right-4 space-y-2">
              <button
                onClick={() => toggleWishlist(product.id)}
                className="p-2 rounded-full shadow-md hover:scale-110 transition-transform duration-200"
                style={{
                  backgroundColor: colors.background,
                  color: wishlist.includes(product.id)
                    ? colors.brown
                    : colors.textSecondary,
                }}
              >
                <HeartIcon
                  className={`w-5 h-5 ${
                    wishlist.includes(product.id) ? "fill-current" : ""
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Link href={`/product/${product.id}`}>
              <h3
                className="text-lg font-medium transition-colors"
                style={{ color: colors.textPrimary }}
              >
                {product.name}
              </h3>
            </Link>
            <p style={{ color: colors.textSecondary }}>{product.category}</p>
            <div className="flex justify-between items-center">
              <p
                className="text-lg font-semibold"
                style={{ color: colors.textPrimary }}
              >
                ${product.price}
              </p>
              <button
                className="p-2 rounded-full border transition-all duration-200"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                onClick={() => addToCart(product.name)}
              >
                <ShoppingBagIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
