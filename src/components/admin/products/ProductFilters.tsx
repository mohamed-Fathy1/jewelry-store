"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Category } from "@/types/category.types";

interface ProductFiltersProps {
  categories: Category[];
  search: string;
  category: string;
  isBestSeller: "" | "true" | "false";
  sort: "" | "price" | "createdAt" | "soldItems";
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onIsBestSellerChange: (value: "" | "true" | "false") => void;
  onSortChange: (value: "" | "price" | "createdAt" | "soldItems") => void;
}

const selectClass =
  "p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brown";

export default function ProductFilters({
  categories,
  search,
  category,
  isBestSeller,
  sort,
  onSearchChange,
  onCategoryChange,
  onIsBestSellerChange,
  onSortChange,
}: ProductFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[220px]">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products by name or description..."
          className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brown"
        />
      </div>

      {/* Category */}
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.categoryName}
          </option>
        ))}
      </select>

      {/* Best Seller */}
      <select
        value={isBestSeller}
        onChange={(e) =>
          onIsBestSellerChange(e.target.value as "" | "true" | "false")
        }
        className={selectClass}
      >
        <option value="">All Best Sellers</option>
        <option value="true">Best Seller</option>
        <option value="false">Not Best Seller</option>
      </select>

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) =>
          onSortChange(
            e.target.value as "" | "price" | "createdAt" | "soldItems"
          )
        }
        className={selectClass}
      >
        <option value="">Sort: Newest</option>
        <option value="createdAt">Sort: Date</option>
        <option value="price">Sort: Price</option>
        <option value="soldItems">Sort: Best Selling</option>
      </select>
    </div>
  );
}
