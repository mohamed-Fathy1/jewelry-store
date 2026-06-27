"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import SmartImage from "@/components/ui/SmartImage";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { Category } from "@/types/category.types";
import { useCategory } from "@/contexts/CategoryContext";

function CategorySkeleton() {
  return (
    <>
      {[...Array(4)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-square rounded-2xl bg-surface-sunken" />
          <div className="mx-auto mt-4 h-4 w-20 rounded bg-surface-sunken" />
        </div>
      ))}
    </>
  );
}

export default function FeaturedCategories() {
  const { categories, getAllCategories, isLoading } = useCategory();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  return (
    <Section id="featured-categories" surface="bg">
      <SectionHeading
        title="Shop by Category"
        description="Find your next piece across our curated edits."
        align="center"
      />
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
        {isLoading ? (
          <CategorySkeleton />
        ) : (
          categories?.map((category: Category) => (
            <motion.div
              key={category._id}
              whileHover={reduceMotion ? undefined : { y: -4 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="group"
            >
              <Link
                href={`/shop?categoryId=${category._id}`}
                className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-muted shadow-soft ring-1 ring-hairline/60 transition-shadow duration-300 group-hover:shadow-card-hover">
                  <SmartImage
                    src={category.image.mediaUrl}
                    alt={category.categoryName}
                    fill
                    sizes="(min-width:1024px) 22vw, 45vw"
                    loading="lazy"
                    fallbackLabel={category.categoryName
                      ?.trim()
                      ?.charAt(0)
                      ?.toUpperCase()}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="inline-block font-display text-lg text-heading">
                    {category.categoryName}
                    <span
                      aria-hidden="true"
                      className="mx-auto mt-1 block h-px w-0 bg-accent transition-all duration-300 group-hover:w-full"
                    />
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </Section>
  );
}
