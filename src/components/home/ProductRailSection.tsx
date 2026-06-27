"use client";

import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types/product.types";

interface ProductRailSectionProps {
  id?: string;
  title: string;
  description?: string;
  link?: { href: string; label: string };
  products: Product[];
  isLoading?: boolean;
  badge?: "bestseller" | "sale" | null;
  /** Max cards to render. */
  limit?: number;
  surface?: "bg" | "surface" | "muted" | "sunken";
}

/**
 * Shared 4-up responsive product grid used by Best Sellers and On Sale. Renders
 * nothing when finished loading with no products (clean empty state).
 */
export default function ProductRailSection({
  id,
  title,
  description,
  link,
  products,
  isLoading = false,
  badge = null,
  limit = 8,
  surface = "bg",
}: ProductRailSectionProps) {
  const items = products.slice(0, limit);

  if (!isLoading && items.length === 0) return null;

  return (
    <Section id={id} surface={surface}>
      <SectionHeading title={title} description={description} link={link} />
      <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-6 md:grid-cols-3 md:gap-x-7 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <ProductCard.Skeleton key={i} />
            ))
          : items.map((product) => (
              <ProductCard key={product._id} product={product} badge={badge} />
            ))}
      </div>
    </Section>
  );
}
