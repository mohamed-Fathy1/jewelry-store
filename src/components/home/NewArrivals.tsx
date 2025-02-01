"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { colors } from "@/constants/colors";
import { useProduct } from "@/contexts/ProductContext";
import LoadingSpinner from "../../components/LoadingSpinner"; // Import the new loading component

export default function NewArrivals() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { products, getAllProducts, isLoading } = useProduct();

  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />; // Updated loading return
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2
        className="text-3xl font-light mb-4"
        style={{ color: colors.textPrimary }}
      >
        New Arrivals
      </h2>
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute z-10 left-0 top-1/2 -translate-y-1/2 -translate-x-5 p-2 rounded-full border shadow-md transition-all duration-200"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute z-10 right-0 top-1/2 -translate-y-1/2 translate-x-5 p-2 rounded-full border shadow-md transition-all duration-200"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide py-4 px-4"
          style={{ scrollBehavior: "smooth", scrollbarWidth: "none" }}
        >
          {products.map((product) => (
            <motion.div
              key={product._id}
              whileHover={{ y: -5 }}
              className="flex-none w-64"
            >
              <Link href={`/product/${product._id}`} className="group">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={product.defaultImage.mediaUrl}
                    alt={product.productName}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-4">
                  <h3
                    className="text-lg font-medium transition-colors"
                    style={{ color: colors.textPrimary }}
                  >
                    {product.productName}
                  </h3>
                  <p
                    className="mt-1 text-lg font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    EGP {product.price.toLocaleString()}
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
