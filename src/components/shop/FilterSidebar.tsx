"use client";

import { useState } from "react";
import { colors } from "@/constants/colors";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { FunnelIcon } from "@heroicons/react/24/solid"; // Import the filter icon

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
    { id: "under-100", name: "Under $100", value: "Under $100" },
    { id: "100-500", name: "$100 - $500", value: "$100 - $500" },
    { id: "500-1000", name: "$500 - $1000", value: "$500 - $1000" },
    { id: "over-1000", name: "Over $1000", value: "Over $1000" },
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
  };

  const handlePriceRangeChange = (value: string) => {
    onFilterChange({
      ...activeFilters,
      priceRange: activeFilters.priceRange === value ? "" : value,
    });
    setIsPricePopupOpen(false); // Close the price popup after selecting a price range
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
        className="hidden md:block w-full py-2 px-4 mb-4 rounded-md flex items-center justify-between"
        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
      >
        <span className="font-medium">Filters</span>
      </button>

      {/* Mobile Price Filter Button */}
      <button
        className="md:hidden py-2 px-4 rounded-md flex gap-5 items-center justify-between"
        onClick={() => setIsPricePopupOpen(true)}
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
      >
        <span className="font-medium">Filter by Price</span>
        <FunnelIcon className="w-5 h-5" />
      </button>

      {/* Price Filter Popup */}
      {isPricePopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md w-3/4 max-w-md">
            <h3 className="text-lg font-medium mb-4">Filter by Price</h3>
            {filterOptions.price.map((option) => (
              <label key={option.id} className="flex items-center mb-2">
                <input
                  type="radio"
                  name="price"
                  className="h-4 w-4 rounded"
                  checked={activeFilters.priceRange === option.value}
                  onChange={() => handlePriceRangeChange(option.value!)}
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  }}
                />
                <span className="ml-3" style={{ color: colors.textSecondary }}>
                  {option.name}
                </span>
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
              className="text-sm hover:underline transition-all duration-200 w-full text-left"
              style={{ color: colors.textSecondary }}
            >
              Clear filters
            </button>
            <button
              onClick={() => setIsPricePopupOpen(false)}
              className="mt-4 py-2 px-4 rounded-md w-full text-center"
              style={{
                backgroundColor: colors.brown,
                color: colors.textLight,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Filters Content */}
      <div className={`hidden space-y-6 md:block`}>
        {Object.entries(filterOptions).map(([category, options]) => (
          <div
            key={category}
            className="pb-6 border-b"
            style={{ borderColor: colors.border }}
          >
            <button
              className="w-full flex items-center justify-between mb-4"
              onClick={() => toggleSection(category)}
            >
              <h3
                className="text-lg font-medium capitalize"
                style={{ color: colors.textPrimary }}
              >
                {category}
              </h3>
              <ChevronDownIcon
                className={`w-5 h-5 transition-transform duration-200 ${
                  expandedSection === category ? "rotate-180" : ""
                }`}
                style={{ color: colors.textSecondary }}
              />
            </button>
            <div
              className={`space-y-3 transition-all duration-200 ${
                expandedSection === category
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              {options.map((option) => (
                <label key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded"
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
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    }}
                  />
                  <span
                    className="ml-3"
                    style={{ color: colors.textSecondary }}
                  >
                    {option.name}
                  </span>
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
          className="text-sm hover:underline transition-all duration-200 w-full text-left"
          style={{ color: colors.textSecondary }}
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}
