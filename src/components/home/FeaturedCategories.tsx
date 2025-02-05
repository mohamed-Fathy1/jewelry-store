"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { colors } from "@/constants/colors";
import { useEffect } from "react";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category.types";
import { useCategory } from "@/contexts/CategoryContext";

function CategorySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="relative aspect-square rounded-lg overflow-hidden bg-gray-200"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
            <div className="h-8 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FeaturedCategories() {
  const { categories, getAllCategories, isLoading } = useCategory();
  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);
  if (isLoading) {
    return (
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mx-auto"></div>
        </div>
        <CategorySkeleton />
      </section>
    );
  }

  return (
    <section
      id="featured-categories"
      className="max-w-7xl mx-auto px-2 md:px-6 lg:px-8 py-16"
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {categories?.map((category: Category) => (
          <motion.div
            key={category._id}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative group"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={category.image.mediaUrl}
                alt={category.categoryName}
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
                  className="text-xl md:text-2xl font-medium mb-4 text-white text-shadow-light md:text-shadow-mid group-hover:text-shadow-mid  md:group-hover:text-shadow-strong transition-all duration-300"
                  style={{ color: colors.textLight }}
                >
                  {category.categoryName}
                </h3>

                <Link
                  href={`/shop?categoryId=${category._id}`}
                  className="py-1 px-4 text-sm md:text-base md:px-6 md:py-2 rounded md:rounded-md font-medium transform transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  }}
                >
                  Shop Now
                </Link>
              </div>
              <p
                className="absolute bottom-[2%] left-1/2 -translate-x-1/2 text-center text-sm mb-2 md:mb-4 text-shadow-light opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{ color: colors.textLight }}
              >
                {category.slug}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
