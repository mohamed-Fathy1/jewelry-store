"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product.types";
import { productService } from "@/services/product.service";
import { colors } from "@/constants/colors";
import ProductCard from "@/components/product/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import SortDropdown from "@/components/shop/SortDropdown";

export default function ShopPage() {
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

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const hasActiveFilters = Object.values(activeFilters).some((filter) =>
          Array.isArray(filter) ? filter.length > 0 : filter !== ""
        );

        let response;
        if (hasActiveFilters) {
          response = await productService.getFilteredProducts(
            {
              ...activeFilters,
              sort: `${sortConfig.sortBy}`,
            },
            currentPage
          );
        } else {
          response = await productService.getAllProducts(currentPage);
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

    fetchProducts();
  }, [currentPage, activeFilters, sortConfig]);

  const handleFilterChange = (filters: typeof activeFilters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  const handleSortChange = (sortBy: string) => {
    setSortConfig({ sortBy });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="hidden md:block lg:col-span-1">
          <FilterSidebar
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Sort Dropdown */}
          <div className="flex items-center justify-between md:justify-end mb-6">
            <div className="flex items-center justify-center md:hidden">
              <FilterSidebar
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                />
                </div>
            <SortDropdown value={sortConfig} onChange={handleSortChange} />
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
                <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>
                  No Products Available
                </h2>
                <p className="text-lg" style={{ color: colors.textSecondary }}>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          currentPage === page ? "bg-brown text-white" : ""
                        }`}
                        style={{
                          backgroundColor:
                            currentPage === page ? colors.brown : "transparent",
                          color:
                            currentPage === page
                              ? colors.textLight
                              : colors.textPrimary,
                        }}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
              )}
              </>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
