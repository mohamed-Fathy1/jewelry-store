"use client";

import { useState } from "react";
import { colors } from "@/constants/colors";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

type FilterOption = {
  id: string;
  name: string;
  value?: string;
};

type Filters = {
  price: FilterOption[];
  material: FilterOption[];
  style: FilterOption[];
};

const filterOptions: Filters = {
  price: [
    { id: "under-100", name: "Under $100", value: "0-100" },
    { id: "100-500", name: "$100 - $500", value: "100-500" },
    { id: "500-1000", name: "$500 - $1000", value: "500-1000" },
    { id: "over-1000", name: "Over $1000", value: "1000+" },
  ],
  material: [
    { id: "gold", name: "Gold" },
    { id: "silver", name: "Silver" },
    { id: "platinum", name: "Platinum" },
    { id: "diamond", name: "Diamond" },
  ],
  style: [
    { id: "classic", name: "Classic" },
    { id: "modern", name: "Modern" },
    { id: "vintage", name: "Vintage" },
    { id: "minimalist", name: "Minimalist" },
  ],
};

export default function FilterSidebar() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    price: [],
    material: [],
    style: [],
  });
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "price"
  );
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const toggleFilter = (category: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  const toggleSection = (category: string) => {
    setExpandedSection(expandedSection === category ? null : category);
  };

  const getActiveFiltersCount = () => {
    return Object.values(activeFilters).reduce(
      (sum, filters) => sum + filters.length,
      0
    );
  };

  return (
    <div className="relative">
      {/* Mobile Filter Button */}
      <button
        className="md:hidden w-full py-2 px-4 mb-4 rounded-md flex items-center justify-between"
        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
      >
        <span className="font-medium">Filters</span>
        <div className="flex items-center">
          {getActiveFiltersCount() > 0 && (
            <span
              className="mr-2 px-2 py-1 rounded-full text-sm"
              style={{
                backgroundColor: colors.brown,
                color: colors.textLight,
              }}
            >
              {getActiveFiltersCount()}
            </span>
          )}
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform duration-200 ${
              isMobileFiltersOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Filters Content */}
      <div
        className={`space-y-6 md:block ${
          isMobileFiltersOpen ? "block" : "hidden"
        }`}
      >
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
                    style={{
                      borderColor: colors.border,
                      color: colors.brown,
                      backgroundColor: activeFilters[category].includes(
                        option.value || option.name
                      )
                        ? colors.brown
                        : colors.background,
                    }}
                    checked={activeFilters[category].includes(
                      option.value || option.name
                    )}
                    onChange={() =>
                      toggleFilter(category, option.value || option.name)
                    }
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
            setActiveFilters({ price: [], material: [], style: [] })
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
