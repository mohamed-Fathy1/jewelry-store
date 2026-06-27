"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Category } from "@/types/category.types";
import { useCategory } from "@/contexts/CategoryContext";
import { iconForCategory } from "@/lib/categoryIcons";

function CircleSkeleton() {
  return (
    <div className="flex w-[68px] flex-none flex-col items-center gap-2.5 sm:w-20">
      <div className="h-[68px] w-[68px] animate-pulse rounded-full bg-surface-sunken sm:h-20 sm:w-20" />
      <div className="h-3 w-12 animate-pulse rounded bg-surface-sunken" />
    </div>
  );
}

export default function CategoryStrip() {
  const { categories, getAllCategories, isLoading } = useCategory();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  const hasCategories = categories && categories.length > 0;
  if (!isLoading && !hasCategories) return null;

  return (
    <section
      aria-label="Browse categories"
      className="border-b border-hairline bg-surface"
    >
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* py-3 here gives the ring + hover-lift room; overflow-x-auto otherwise
            clips the y-axis (CSS computes overflow-y to auto), slicing the top. */}
        <div className="scrollbar-hide overflow-x-auto py-3">
          <ul className="mx-auto flex w-max gap-6 sm:gap-9">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <li key={i}>
                    <CircleSkeleton />
                  </li>
                ))
              : categories.map((category: Category) => {
                  // Backend icon (wired via icon_id) is the source of truth;
                  // the local registry is a fallback for unlinked categories.
                  const icon =
                    category.icon_id?.svg ||
                    iconForCategory(category.categoryName);
                  return (
                    <li key={category._id}>
                      <Link
                        href={`/shop?categoryId=${category._id}`}
                        className="group flex w-[68px] flex-none flex-col items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:w-20"
                      >
                        {/* Real category icon (currentColor) → falls back to a serif monogram. */}
                        <motion.span
                          whileHover={reduceMotion ? undefined : { y: -3 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="grid h-[68px] w-[68px] place-items-center rounded-full bg-surface-muted text-heading ring-1 ring-hairline transition-colors duration-300 group-hover:bg-accent-soft group-hover:text-primary group-hover:ring-accent sm:h-20 sm:w-20"
                        >
                          {icon ? (
                            <span
                              aria-hidden="true"
                              className="grid place-items-center [&_svg]:h-9 [&_svg]:w-9 sm:[&_svg]:h-10 sm:[&_svg]:w-10"
                              dangerouslySetInnerHTML={{ __html: icon }}
                            />
                          ) : (
                            <span className="font-display text-2xl sm:text-[1.75rem]">
                              {category.categoryName
                                ?.trim()
                                ?.charAt(0)
                                ?.toUpperCase()}
                            </span>
                          )}
                        </motion.span>
                        <span className="line-clamp-1 w-full text-center text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted transition-colors group-hover:text-heading">
                          {category.categoryName}
                        </span>
                      </Link>
                    </li>
                  );
                })}
          </ul>
        </div>
      </div>
    </section>
  );
}
