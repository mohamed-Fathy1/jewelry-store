"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types/product.types";
import { productService } from "@/services/product.service";
import { colors } from "@/constants/colors";
import ProductCard from "@/components/product/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import SortDropdown from "@/components/shop/SortDropdown";
import Pagination from "@/components/common/Pagination";
import { useRouter } from "next/navigation";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({
    material: [] as string[],
    style: [] as string[],
    priceRange: "" as string,
  });
  const [sortConfig, setSortConfig] = useState({
    sortBy: "",
  });
  const isSale = searchParams.get("sale");

  useEffect(() => {
    const fetchData = async () => {
      // Get values from search params
      const sort = searchParams.get("sort");
      const price = searchParams.get("price");
      const page = searchParams.get("page");
      const categoryId = searchParams.get("categoryId");

      // Update local state without triggering re-renders
      const currentPageValue = page ? parseInt(page) : 1;
      const currentFilters = {
        ...activeFilters,
        priceRange: price || "",
      };
      const currentSort = { sortBy: sort || "" };

      // Set state values
      setCurrentPage(currentPageValue);
      setSortConfig(currentSort);
      setActiveFilters(currentFilters);

      // Fetch products
      setIsLoading(true);
      try {
        let response;

        if (categoryId) {
          // If we have a category ID, fetch products for that category
          response = await productService.getProductsByCategoryId(
            categoryId,
            currentPageValue,
            {
              ...currentFilters,
              sort: sort,
              priceRange: price,
            }
          );
        } else if (isSale === "true") {
          // If we're viewing sale items
          response = await productService.getAllSaleProducts(currentPageValue);
        } else if (
          Object.values(currentFilters).some((filter) =>
            Array.isArray(filter) ? filter.length > 0 : filter !== ""
          ) ||
          currentSort.sortBy ||
          price
        ) {
          // If we have active filters
          response = await productService.getFilteredProducts(
            {
              ...currentFilters,
              sort: sort,
              priceRange: price,
            },
            currentPageValue
          );
        } else {
          // Default: fetch all products
          response = await productService.getAllProducts(currentPageValue);
        }

        if (response.success) {
          setProducts(response.data.products.data);
          setTotalPages(response.data.products.totalPages);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams, isSale]);

  const handleFilterChange = (filters: typeof activeFilters) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", "1");
    router.push(`/shop?${newSearchParams.toString()}`);
    setActiveFilters(filters);
  };

  const handleSortChange = (sortBy: string) => {
    setSortConfig({ sortBy });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", page.toString());
    router.push(`/shop?${newSearchParams.toString()}`);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="hidden md:block lg:col-span-1">
          {!isSale && (
            <FilterSidebar
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
            />
          )}
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Sort Dropdown */}
          <div className="flex items-center justify-between md:justify-end mb-6">
            {!isSale && (
              <>
                <div className="flex items-center justify-center md:hidden">
                  <FilterSidebar
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                  />
                </div>
                <SortDropdown value={sortConfig} onChange={handleSortChange} />
              </>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <ProductCard.Skeleton key={index} />
                ))}
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <h2
                    className="text-2xl font-bold mb-4"
                    style={{ color: colors.textPrimary }}
                  >
                    No Products Available
                  </h2>
                  <p
                    className="text-lg"
                    style={{ color: colors.textSecondary }}
                  >
                    Please check back later or explore other categories.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    className="mt-8"
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
