"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  {
    id: 1,
    name: "Necklaces",
    image: "/images/categories/necklaces.jpg",
    href: "/shop?category=necklaces",
  },
  {
    id: 2,
    name: "Rings",
    image: "/images/categories/rings.jpg",
    href: "/shop?category=rings",
  },
  {
    id: 3,
    name: "Earrings",
    image: "/images/categories/earrings.jpg",
    href: "/shop?category=earrings",
  },
  {
    id: 4,
    name: "Bracelets",
    image: "/images/categories/bracelets.jpg",
    href: "/shop?category=bracelets",
  },
];

export default function FeaturedCategories() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-light text-center mb-12">
        Shop by Category
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative group"
          >
            <div className="aspect-square overflow-hidden rounded-lg">
              <Image
                src={category.image}
                alt={category.name}
                width={500}
                height={500}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity group-hover:bg-opacity-40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h3 className="text-2xl font-light mb-4">{category.name}</h3>
                <Link
                  href={category.href}
                  className="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
