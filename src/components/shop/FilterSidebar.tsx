"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { FunnelIcon } from "@heroicons/react/24/solid"; // Import the filter icon
import { cn } from "@/lib/cn";
import { useSearchParams, useRouter } from "next/navigation";

type FilterOption = {
  id: string;
  name: string;
  value?: string;
};

interface FilterSidebarProps {
  activeFilters: {
    material: string[];
    style: string[];
    priceRange: string;
  };
  onFilterChange: (filters: FilterSidebarProps["activeFilters"]) => void;
}

const filterOptions = {
  price: [
    { id: "under-100", name: "Under LE 100", value: "Under $100" },
    { id: "100-500", name: "LE 100 - LE 500", value: "$100 - $500" },
    { id: "500-1000", name: "LE 500 - LE 1000", value: "$500 - $1000" },
    { id: "over-1000", name: "Over LE 1000", value: "Above $1000" },
  ],
};

export default function FilterSidebar({
  activeFilters,
  onFilterChange,
}: FilterSidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "price"
  );
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isPricePopupOpen, setIsPricePopupOpen] = useState(false); // State for price popup
  const searchParams = useSearchParams();
  const router = useRouter();
  const price = searchParams.get("price");

  const toggleFilter = (category: "material" | "style", value: string) => {
    const currentFilters = [...activeFilters[category]];
    const index = currentFilters.indexOf(value);

    if (index === -1) {
      currentFilters.push(value);
    } else {
      currentFilters.splice(index, 1);
    }

    onFilterChange({
      ...activeFilters,
      [category]: currentFilters,
    });
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("price", price || "");
    router.push(`/shop?${newSearchParams.toString()}`);
  };

  const handlePriceRangeChange = (value: string) => {
    onFilterChange({
      ...activeFilters,
      priceRange: activeFilters.priceRange === value ? "" : value,
    });
    setIsPricePopupOpen(false); // Close the price popup after selecting a price range
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("price", value);
    router.push(`/shop?${newSearchParams.toString()}`);
  };

  const toggleSection = (category: string) => {
    setExpandedSection(expandedSection === category ? null : category);
  };

  const getActiveFiltersCount = () => {
    return (
      activeFilters.material.length +
      activeFilters.style.length +
      (activeFilters.priceRange ? 1 : 0)
    );
  };

  return (
    <div className="relative">
      {/* Mobile Filter Button */}
      <button
        className="hidden md:flex w-full py-2 px-4 mb-4 items-center justify-between rounded-lg border border-hairline bg-surface text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
      >
        <span className="font-medium">Filters</span>
      </button>

      {/* Mobile Price Filter Button */}
      <button
        className={cn(
          "md:hidden inline-flex h-10 items-center gap-2 rounded-full border bg-surface pl-3 pr-4 text-sm font-medium shadow-soft transition-colors duration-200 hover:border-primary/40 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          activeFilters.priceRange
            ? "border-primary/50 text-heading"
            : "border-hairline text-ink"
        )}
        onClick={() => setIsPricePopupOpen(true)}
      >
        <FunnelIcon className="h-4 w-4 text-ink-muted" />
        <span>{activeFilters.priceRange || "Filter by Price"}</span>
        {activeFilters.priceRange && (
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
        )}
      </button>

      {/* Price Filter Popup — bottom-sheet on mobile, centered card on larger screens */}
      {isPricePopupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-noir/50 backdrop-blur-sm p-0 sm:items-center sm:p-4 animate-[fadeIn_150ms_ease-out]"
          onClick={() => setIsPricePopupOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-surface px-5 pb-6 pt-3 shadow-card-hover sm:rounded-3xl sm:pt-5 motion-safe:animate-[sheetUp_220ms_cubic-bezier(0.22,1,0.36,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grabber handle (mobile sheet affordance) */}
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-hairline sm:hidden" />

            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl text-heading">
                Filter by Price
              </h3>
              {activeFilters.priceRange && (
                <button
                  onClick={() =>
                    onFilterChange({ material: [], style: [], priceRange: "" })
                  }
                  className="rounded-full px-3 py-1 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-2">
              {filterOptions.price.map((option) => {
                const selected = activeFilters.priceRange === option.value;
                return (
                  <button
                    key={option.id}
                    onClick={() => handlePriceRangeChange(option.value!)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-[15px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      selected
                        ? "border-primary/50 bg-primary/10 font-semibold text-heading"
                        : "border-hairline text-ink hover:border-primary/30 hover:bg-surface-sunken"
                    )}
                  >
                    {option.name}
                    <span
                      className={cn(
                        "grid h-5 w-5 place-items-center rounded-full border-2 transition-all duration-150",
                        selected
                          ? "border-primary bg-primary scale-100"
                          : "border-hairline"
                      )}
                    >
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full bg-on-primary transition-transform duration-150",
                          selected ? "scale-100" : "scale-0"
                        )}
                      />
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsPricePopupOpen(false)}
              className="mt-5 w-full rounded-2xl bg-primary py-3 px-4 text-center font-semibold text-on-primary shadow-card transition-all hover:bg-primary-hover hover:shadow-card-hover active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Show results
            </button>
          </div>
        </div>
      )}

      {/* Filters Content */}
      <div className={`hidden space-y-6 md:block`}>
        {Object.entries(filterOptions).map(([category, options]) => (
          <div key={category} className="pb-6 border-b border-hairline">
            <button
              className="w-full flex items-center justify-between mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
              onClick={() => toggleSection(category)}
            >
              <h3 className="font-display text-lg capitalize text-heading">
                {category}
              </h3>
              <ChevronDownIcon
                className={cn(
                  "w-5 h-5 text-ink-muted transition-transform duration-200",
                  expandedSection === category ? "rotate-180" : ""
                )}
              />
            </button>
            <div
              className={cn(
                "space-y-3 transition-all duration-200",
                expandedSection === category
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              )}
            >
              {options.map((option) => (
                <label key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-hairline accent-primary"
                    checked={
                      category === "price"
                        ? activeFilters.priceRange === option.value
                        : activeFilters[
                            category as "material" | "style"
                          ].includes(option.name)
                    }
                    onChange={() =>
                      category === "price"
                        ? handlePriceRangeChange(option.value!)
                        : toggleFilter(
                            category as "material" | "style",
                            option.name
                          )
                    }
                  />
                  <span className="ml-3 text-ink-muted">{option.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={() =>
            onFilterChange({
              material: [],
              style: [],
              priceRange: "",
            })
          }
          className="w-full text-left text-sm text-ink-muted transition-all duration-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}
