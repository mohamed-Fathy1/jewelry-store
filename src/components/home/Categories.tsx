"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SmartImage from "@/components/ui/SmartImage";
import { useCategory } from "@/contexts/CategoryContext";

function CategorySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 aspect-square rounded-2xl bg-surface-sunken"></div>
      <div className="h-4 w-3/4 rounded bg-surface-sunken"></div>
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
      <h2 className="mb-12 text-center font-display text-3xl text-heading">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {categories.map((category) => (
          <motion.div
            key={category._id}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Link
              href={`/category/${category.slug}`}
              className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl bg-surface-muted shadow-soft ring-1 ring-hairline/60 transition-shadow duration-300 group-hover:shadow-card-hover">
                <SmartImage
                  src={category.image.mediaUrl}
                  alt={category.categoryName}
                  fill
                  sizes="(min-width:1024px) 16vw, (min-width:768px) 25vw, 45vw"
                  loading="lazy"
                  fallbackLabel={category.categoryName
                    ?.trim()
                    ?.charAt(0)
                    ?.toUpperCase()}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="text-center font-display text-lg text-heading transition-colors">
                {category.categoryName}
              </h3>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
