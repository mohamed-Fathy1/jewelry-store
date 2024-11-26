"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";

const relatedProducts: Product[] = [
  {
    id: "2",
    name: "Gold Chain Bracelet",
    description: "Elegant gold chain bracelet",
    price: 499.99,
    images: ["/images/products/bracelet-1.jpg"],
    category: "Bracelets",
    material: "Gold",
    rating: 4.2,
    reviews: 8,
    inStock: true,
  },
  // Add more related products...
];

export default function RelatedProducts() {
  return (
    <div>
      <h2 className="text-2xl font-light mb-6">You may also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="group"
          >
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={product.images[0]}
                alt={product.name}
                width={500}
                height={500}
                className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                {product.name}
              </h3>
              <p className="text-gray-500">{product.category}</p>
              <p className="mt-2 font-semibold">${product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
