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
        className="md:hidden flex gap-5 items-center justify-between py-2 px-4 rounded-lg border border-hairline bg-surface text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        onClick={() => setIsPricePopupOpen(true)}
      >
        <span className="font-medium">Filter by Price</span>
        <FunnelIcon className="w-5 h-5" />
      </button>

      {/* Price Filter Popup */}
      {isPricePopupOpen && (
        <div className="fixed inset-0 bg-noir/50 flex items-center justify-center z-50">
          <div className="w-3/4 max-w-md rounded-xl bg-surface p-4 shadow-card-hover">
            <h3 className="mb-4 font-display text-lg text-heading">
              Filter by Price
            </h3>
            {filterOptions.price.map((option) => (
              <label key={option.id} className="flex items-center mb-2">
                <input
                  type="radio"
                  name="price"
                  className="h-4 w-4 rounded border-hairline accent-primary"
                  checked={activeFilters.priceRange === option.value}
                  onChange={() => handlePriceRangeChange(option.value!)}
                />
                <span className="ml-3 text-ink-muted">{option.name}</span>
              </label>
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
              Clear filters
            </button>
            <button
              onClick={() => setIsPricePopupOpen(false)}
              className="mt-4 w-full rounded-lg bg-primary py-2 px-4 text-center text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Close
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
