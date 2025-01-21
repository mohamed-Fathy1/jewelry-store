"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { colors } from "@/constants/colors";
import { useCategory } from "@/contexts/CategoryContext";

function CategorySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-lg bg-gray-200 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  );
}

export default function Categories() {
  const { categories, getAllCategories, isLoading } = useCategory();

  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <CategorySkeleton key={index} />
          ))}
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2
        className="text-3xl font-light text-center mb-12"
        style={{ color: colors.textPrimary }}
      >
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {categories.map((category) => (
          <motion.div
            key={category._id}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Link href={`/category/${category.slug}`}>
              <div className="aspect-square rounded-lg overflow-hidden mb-4">
                <Image
                  src={category.image.mediaUrl}
                  alt={category.categoryName}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3
                className="text-center text-lg font-medium transition-colors"
                style={{ color: colors.textPrimary }}
              >
                {category.categoryName}
              </h3>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
