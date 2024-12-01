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
    description: "Elegant chains and pendants",
  },
  {
    id: 2,
    name: "Rings",
    image: "/images/IMG_1859.JPG",
    href: "/shop?category=rings",
    description: "Stunning statement pieces",
  },
  {
    id: 3,
    name: "Earrings",
    image: "/images/IMG_3758.JPG",
    href: "/shop?category=earrings",
    description: "Classic and modern styles",
  },
  {
    id: 4,
    name: "Bracelets",
    image: "/images/IMG_3095.JPG",
    href: "/shop?category=bracelets",
    description: "Timeless elegance",
  },
];

export default function FeaturedCategories() {
  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      style={{ backgroundColor: colors.background }}
    >
      <div className="text-center mb-8">
        <h2
          className="text-3xl font-light mb-4"
          style={{ color: colors.textPrimary }}
        >
          Shop by Category
        </h2>
        <p style={{ color: colors.textSecondary }}>
          Discover our curated collection of fine jewelry
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative group"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={category.image}
                alt={category.name}
                width={500}
                height={500}
                className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500 overflow-hidden"
              />
              <div
                className="absolute inset-0 transition-opacity duration-300 opacity-20 group-hover:opacity-40"
                style={{ backgroundColor: colors.accentDark }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <h3
                  className="text-2xl font-medium mb-4 text-white text-shadow-mid group-hover:text-shadow-strong transition-all duration-300"
                  style={{ color: colors.textLight }}
                >
                  {category.name}
                </h3>

                <Link
                  href={category.href}
                  className="px-6 py-2 rounded-md font-medium transform transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  }}
                >
                  Shop Now
                </Link>
              </div>
              <p
                className="absolute bottom-[5%] left-1/2 -translate-x-1/2 text-center text-sm mb-4 text-shadow-light opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{ color: colors.textLight }}
              >
                {category.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
