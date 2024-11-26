"use client";

import { useState } from "react";

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

  const toggleFilter = (category: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  return (
    <div className="space-y-6">
      {Object.entries(filterOptions).map(([category, options]) => (
        <div key={category} className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
            {category}
          </h3>
          <div className="space-y-3">
            {options.map((option) => (
              <label key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  checked={activeFilters[category].includes(
                    option.value || option.name
                  )}
                  onChange={() =>
                    toggleFilter(category, option.value || option.name)
                  }
                />
                <span className="ml-3 text-gray-600">{option.name}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={() => setActiveFilters({ price: [], material: [], style: [] })}
        className="text-sm text-gray-500 hover:text-black"
      >
        Clear all filters
      </button>
    </div>
  );
}
