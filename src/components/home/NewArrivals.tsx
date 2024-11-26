"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const newArrivals = [
  {
    id: "1",
    name: "Diamond Tennis Bracelet",
    price: 1299.99,
    image: "/images/products/bracelet-1.jpg",
    href: "/product/1",
  },
  {
    id: "2",
    name: "Pearl Drop Earrings",
    price: 499.99,
    image: "/images/products/earrings-1.jpg",
    href: "/product/2",
  },
  {
    id: "3",
    name: "Sapphire Ring",
    price: 899.99,
    image: "/images/products/ring-1.jpg",
    href: "/product/3",
  },
  {
    id: "4",
    name: "Gold Chain Necklace",
    price: 799.99,
    image: "/images/products/necklace-1.jpg",
    href: "/product/4",
  },
  // Add more products as needed
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-light">New Arrivals</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full border border-gray-300 hover:border-gray-400"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full border border-gray-300 hover:border-gray-400"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
      >
        {newArrivals.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -5 }}
            className="flex-none w-64"
          >
            <Link href={product.href} className="group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {product.name}
                </h3>
                <p className="mt-1 text-lg font-semibold">${product.price}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
