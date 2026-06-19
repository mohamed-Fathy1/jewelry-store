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
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      {/* Search */}
      <SearchInput
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search products by name or description…"
        ariaLabel="Search products"
        className="flex-1 min-w-[220px]"
      />

      {/* Category */}
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={adminInputClass + " w-auto"}
        aria-label="Filter by category"
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
        className={adminInputClass + " w-auto"}
        aria-label="Filter by best seller"
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
        className={adminInputClass + " w-auto"}
        aria-label="Sort products"
      >
        <option value="">Sort: Newest</option>
        <option value="createdAt">Sort: Date</option>
        <option value="price">Sort: Price</option>
        <option value="soldItems">Sort: Best Selling</option>
      </select>
    </div>
  );
}
