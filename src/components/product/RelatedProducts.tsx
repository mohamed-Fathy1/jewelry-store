"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { colors } from "@/constants/colors";

const relatedProducts: Product[] = [
  {
    id: "2",
    name: "Gold Chain Bracelet",
    description: "Elegant gold chain bracelet",
    price: 499.99,
    images: ["/images/IMG_3176.PNG"],
    category: "Bracelets",
    material: "Gold",
    rating: 4.2,
    reviews: 8,
    inStock: true,
  },
  {
    id: "3",
    name: "Diamond Earrings",
    description: "Classic diamond studs",
    price: 799.99,
    images: ["/images/IMG_3177.PNG"],
    category: "Earrings",
    material: "Gold",
    rating: 4.8,
    reviews: 15,
    inStock: true,
  },
  {
    id: "4",
    name: "Pearl Necklace",
    description: "Elegant pearl strand",
    price: 599.99,
    images: ["/images/IMG_2950.JPG"],
    category: "Necklaces",
    material: "Pearl",
    rating: 4.6,
    reviews: 10,
    inStock: true,
  },
  // Add more related products as needed
];

export default function RelatedProducts() {
  return (
    <div>
      <h2
        className="text-2xl font-light mb-6"
        style={{ color: colors.textPrimary }}
      >
        You may also like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="group"
          >
            <div
              className="aspect-square overflow-hidden rounded-lg"
              style={{ backgroundColor: colors.background }}
            >
              <Image
                src={product.images[0]}
                alt={product.name}
                width={500}
                height={500}
                className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="mt-4">
              <h3
                className="text-lg font-medium transition-colors duration-200"
                style={{ color: colors.textPrimary }}
              >
                {product.name}
              </h3>
              <p style={{ color: colors.textSecondary }}>{product.category}</p>
              <p
                className="mt-2 font-semibold"
                style={{ color: colors.textPrimary }}
              >
                ${product.price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
