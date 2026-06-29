"use client";

import { useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types/product.types";

interface NewArrivalsProps {
  products: Product[];
  isLoading: boolean;
}

// Data comes from the aggregated /home payload (via useHome on the homepage),
// passed in as props — this section does not fetch on its own.
export default function NewArrivals({ products, isLoading }: NewArrivalsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const items = (products ?? []).slice(0, 12);
  if (!isLoading && items.length === 0) return null;

  return (
    <Section>
      <SectionHeading
        title="New Arrivals"
        description="The latest additions to the collection."
        link={{ href: "/shop", label: "Shop all" }}
      />

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-0 top-1/3 z-10 hidden h-10 w-10 -translate-x-4 place-items-center rounded-full border border-hairline bg-surface text-ink shadow-card transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:grid"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-0 top-1/3 z-10 hidden h-10 w-10 translate-x-4 place-items-center rounded-full border border-hairline bg-surface text-ink shadow-card transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:grid"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>

        <div
          ref={scrollContainerRef}
          className="scrollbar-hide flex gap-5 overflow-x-auto px-1 py-4"
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-60 flex-none">
                  <ProductCard.Skeleton />
                </div>
              ))
            : items.map((product) => (
                <div key={product._id} className="w-60 flex-none">
                  <ProductCard
                    product={product}
                    sizes="240px"
                    badge="new"
                  />
                </div>
              ))}
        </div>
      </div>
    </Section>
  );
}
