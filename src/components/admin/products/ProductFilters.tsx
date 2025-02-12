"use client";

import { useState } from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { colors } from "@/constants/colors";
import { useDebounce } from "@/hooks/useDebounce";

interface ProductFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: "all" | "sale" | "soldout") => void;
}

export default function ProductFilters({
  onSearch,
  onFilterChange,
  selectedFilter,
}: ProductFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Use debounce hook for search
  const debouncedSearch = useDebounce((value: string) => {
    onSearch(0, value);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleFilterSelect = (filter: "all" | "sale" | "soldout") => {
    onFilterChange(filter);
    setSearchQuery(""); // Clear search when changing filters
    setIsFilterOpen(false);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brown"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filter
        </button>
      </div>

      {/* Filter Dialog */}
      <Dialog
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg w-full max-w-md mx-auto p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Filter Products
            </Dialog.Title>

            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  checked={selectedFilter === "all"}
                  onChange={() => handleFilterSelect("all")}
                  className="form-radio text-brown"
                />
                <span>All Products</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  checked={selectedFilter === "sale"}
                  onChange={() => handleFilterSelect("sale")}
                  className="form-radio text-brown"
                />
                <span>On Sale</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  checked={selectedFilter === "soldout"}
                  onChange={() => handleFilterSelect("soldout")}
                  className="form-radio text-brown"
                />
                <span>Sold Out</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
