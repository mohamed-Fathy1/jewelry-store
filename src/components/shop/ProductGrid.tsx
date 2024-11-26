"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

// This would typically come from an API
const products: Product[] = [
  {
    id: "1",
    name: "Diamond Pendant Necklace",
    description: "Elegant diamond pendant in 18k gold",
    price: 999.99,
    images: ["/images/products/necklaces/necklace-1.jpg"],
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
    images: ["/images/products/rings/ring-1.jpg"],
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
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
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
                className="p-2 rounded-full bg-white shadow-md hover:scale-110 transition-transform duration-200"
              >
                <HeartIcon
                  className={`w-5 h-5 ${
                    wishlist.includes(product.id)
                      ? "text-red-500"
                      : "text-gray-600"
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Link href={`/product/${product.id}`}>
              <h3 className="text-xl font-medium text-gray-700 group-hover:text-black transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="text-gray-500">{product.category}</p>
            <div className="flex justify-between items-center">
              <p className="text-xl font-semibold text-gray-700">
                ${product.price}
              </p>
              <button
                className="p-2 rounded-full bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-black transition-all duration-200"
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
