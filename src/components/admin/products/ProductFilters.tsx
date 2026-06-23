"use client";

import { Category } from "@/types/category.types";
import { SearchInput, Select, type SelectOption } from "@/components/admin/ui";

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
  const categoryOptions: SelectOption[] = [
    { value: "", label: "All Categories" },
    ...categories.map((cat) => ({ value: cat._id, label: cat.categoryName })),
  ];

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
        <Select
          ariaLabel="Filter by category"
          value={category}
          onChange={onCategoryChange}
          options={categoryOptions}
          searchable
        />

        <Select
          ariaLabel="Filter by best seller"
          value={isBestSeller}
          onChange={(v) => onIsBestSellerChange(v as "" | "true" | "false")}
          options={[
            { value: "", label: "All Best Sellers" },
            { value: "true", label: "Best Seller" },
            { value: "false", label: "Not Best Seller" },
          ]}
        />

        <Select
          ariaLabel="Sort products"
          value={sort}
          onChange={(v) =>
            onSortChange(v as "" | "price" | "createdAt" | "soldItems")
          }
          options={[
            { value: "", label: "Sort: Newest" },
            { value: "createdAt", label: "Sort: Date" },
            { value: "price", label: "Sort: Price" },
            { value: "soldItems", label: "Sort: Best Selling" },
          ]}
        />
      </div>
    </div>
  );
}
