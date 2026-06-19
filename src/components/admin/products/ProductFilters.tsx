"use client";

import { Category } from "@/types/category.types";
import { SearchInput, adminInputClass } from "@/components/admin/ui";

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
  const selectClass = `${adminInputClass} cursor-pointer`;

  return (
    <div className="mb-6 space-y-3">
      {/* Search */}
      <SearchInput
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search products by name or description…"
        ariaLabel="Search products"
        className="w-full"
      />

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={selectClass}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.categoryName}
            </option>
          ))}
        </select>

        <select
          value={isBestSeller}
          onChange={(e) =>
            onIsBestSellerChange(e.target.value as "" | "true" | "false")
          }
          className={selectClass}
          aria-label="Filter by best seller"
        >
          <option value="">All Best Sellers</option>
          <option value="true">Best Seller</option>
          <option value="false">Not Best Seller</option>
        </select>

        <select
          value={sort}
          onChange={(e) =>
            onSortChange(
              e.target.value as "" | "price" | "createdAt" | "soldItems"
            )
          }
          className={selectClass}
          aria-label="Sort products"
        >
          <option value="">Sort: Newest</option>
          <option value="createdAt">Sort: Date</option>
          <option value="price">Sort: Price</option>
          <option value="soldItems">Sort: Best Selling</option>
        </select>
      </div>
    </div>
  );
}
