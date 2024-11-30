"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { colors } from "@/constants/colors";

const newArrivals = [
  {
    id: "1",
    name: "Diamond Tennis Bracelet",
    price: 1299.99,
    image: "/images/IMG_3176.PNG",
    href: "/product/1",
  },
  {
    id: "2",
    name: "Pearl Drop Earrings",
    price: 499.99,
    image: "/images/IMG_3177.PNG",
    href: "/product/2",
  },
  {
    id: "3",
    name: "Sapphire Ring",
    price: 899.99,
    image: "/images/IMG_1858.JPG",
    href: "/product/3",
  },
  {
    id: "4",
    name: "Gold Chain Necklace",
    price: 799.99,
    image: "/images/IMG_2950.JPG",
    href: "/product/4",
  },
  {
    id: "5",
    name: "Emerald Pendant",
    price: 1499.99,
    image: "/images/IMG_2953.JPG",
    href: "/product/5",
  },
  {
    id: "6",
    name: "Ruby Earrings",
    price: 999.99,
    image: "/images/IMG_3758.JPG",
    href: "/product/6",
  },
  {
    id: "7",
    name: "Diamond Ring",
    price: 2499.99,
    image: "/images/IMG_1859.JPG",
    href: "/product/7",
  },
  {
    id: "8",
    name: "Pearl Bracelet",
    price: 599.99,
    image: "/images/IMG_3095.JPG",
    href: "/product/8",
  },
];

export default function NewArrivals() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      style={{ backgroundColor: colors.background }}
    >
      <h2
        className="text-3xl font-light mb-8"
        style={{ color: colors.textPrimary }}
      >
        New Arrivals
      </h2>
      <div className="relative">
        {/* Left Chevron */}
        <button
          onClick={() => scroll("left")}
          className="absolute z-10 left-0 top-1/2 -translate-y-1/2 -translate-x-5 p-2 rounded-full shadow-md transition-all duration-200"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        {/* Right Chevron */}
        <button
          onClick={() => scroll("right")}
          className="absolute z-10 right-0 top-1/2 -translate-y-1/2 translate-x-5 p-2 rounded-full shadow-md transition-all duration-200"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>

        {/* Products Container */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 px-4"
          style={{ scrollBehavior: "smooth", scrollbarWidth: "none" }}
        >
          {newArrivals.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -5 }}
              className="flex-none w-64"
            >
              <Link href={product.href} className="group">
                <div
                  className="aspect-square rounded-lg overflow-hidden"
                  style={{ backgroundColor: colors.background }}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-4">
                  <h3
                    className="text-lg font-medium transition-colors"
                    style={{
                      color: colors.textPrimary,
                    }}
                  >
                    {product.name}
                  </h3>
                  <p
                    className="mt-1 text-lg font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    ${product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
