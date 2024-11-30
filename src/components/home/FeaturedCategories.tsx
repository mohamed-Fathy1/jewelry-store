"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { colors } from "@/constants/colors";

const categories = [
  {
    id: 1,
    name: "Necklaces",
    image: "/images/IMG_2953.JPG",
    href: "/shop?category=necklaces",
  },
  {
    id: 2,
    name: "Rings",
    image: "/images/IMG_1859.JPG",
    href: "/shop?category=rings",
  },
  {
    id: 3,
    name: "Earrings",
    image: "/images/IMG_3758.JPG",
    href: "/shop?category=earrings",
  },
  {
    id: 4,
    name: "Bracelets",
    image: "/images/IMG_3095.JPG",
    href: "/shop?category=bracelets",
  },
];

export default function FeaturedCategories() {
  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      style={{ backgroundColor: colors.background }}
    >
      <h2
        className="text-3xl font-light text-center mb-12"
        style={{ color: colors.textPrimary }}
      >
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
            <div className="aspect-square rounded-lg">
              <Image
                src={category.image}
                alt={category.name}
                width={500}
                height={500}
                className="object-cover w-full h-full rounded-lg overflow-hidden"
              />
              <div
                className="absolute inset-0 transition-all duration-300 opacity-40 group-hover:opacity-50 rounded-lg"
                style={{
                  backgroundColor: colors.accentDark,
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h3
                  className="text-2xl font-medium mb-4"
                  style={{
                    color: colors.textLight,
                    filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 1))",
                  }}
                >
                  {category.name}
                </h3>
                <Link
                  href={category.href}
                  className="px-6 py-2 rounded-md font-medium transition-colors duration-200"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  }}
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
