"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  PencilIcon,
  TrashIcon,
  ArchiveBoxXMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CubeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import Image from "next/image";
import { colors } from "@/constants/colors";
import { formatPrice } from "@/utils/format";
import { AdminProduct } from "@/types/admin-product.types";
import { Category } from "@/types/category.types";
import { productsService } from "@/services/products.service";
import { categoryService } from "@/services/category.service";
import { useDebounce } from "@/hooks/useDebounce";
import toast from "react-hot-toast";
import ProductFilters from "./ProductFilters";

interface ProductListProps {
  onEdit: (product: AdminProduct) => void;
}

export interface ProductListRef {
  fetchProducts: () => Promise<void>;
}

const ProductList = forwardRef<ProductListRef, ProductListProps>(
  ({ onEdit }, ref) => {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    // `searchTerm` is the controlled input value (instant); `search` is the
    // debounced value actually sent to the API.
    const [searchTerm, setSearchTerm] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [isBestSeller, setIsBestSeller] = useState<"" | "true" | "false">("");
    // Active products only by default (isDeleted=false).
    const [isDeleted, setIsDeleted] = useState<"false" | "true">("false");
    const [sort, setSort] = useState<"" | "price" | "createdAt" | "soldItems">(
      ""
    );

    // Hard-delete (type-to-confirm) modal state
    const [hardDeleteTarget, setHardDeleteTarget] =
      useState<AdminProduct | null>(null);
    const [confirmText, setConfirmText] = useState("");
    const [isHardDeleting, setIsHardDeleting] = useState(false);

    const fetchProducts = async (page: number = currentPage) => {
      setIsLoading(true);
      try {
        const response = await productsService.getProducts({
          page,
          limit: 20,
          search: search.trim() || undefined,
          category: category || undefined,
          isBestSeller: isBestSeller || undefined,
          isDeleted,
          sort: sort || undefined,
        });
        setProducts(response.data.products);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } catch (error) {
        toast.error("Failed to fetch products");
      } finally {
        setIsLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      fetchProducts: () => fetchProducts(currentPage),
    }));

    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const response = await categoryService.getAllCategories();
          setCategories(response.data.categories || []);
        } catch (error) {
          // Filters still render with an empty category list.
        }
      };
      fetchCategories();
    }, []);

    useEffect(() => {
      fetchProducts(currentPage);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, search, category, isBestSeller, isDeleted, sort]);

    const resetToFirstPage = () => setCurrentPage(1);

    // Debounce the search input (~400ms): commit the value and reset to page 1.
    const debouncedSetSearch = useDebounce((value: string) => {
      setSearch(value);
      setCurrentPage(1);
    }, 400);

    const handleSearchChange = (value: string) => {
      setSearchTerm(value);
      debouncedSetSearch(value);
    };

    const handleSoftDelete = async (product: AdminProduct) => {
      if (
        window.confirm(
          `Soft delete "${product.productName}"? It will be hidden but can be restored.`
        )
      ) {
        try {
          await productsService.softDeleteProduct(product._id);
          toast.success("Product deleted successfully");
          fetchProducts(currentPage);
        } catch (error) {
          toast.error("Failed to delete product");
        }
      }
    };

    const openHardDelete = (product: AdminProduct) => {
      setHardDeleteTarget(product);
      setConfirmText("");
    };

    const closeHardDelete = () => {
      setHardDeleteTarget(null);
      setConfirmText("");
    };

    const confirmHardDelete = async () => {
      if (!hardDeleteTarget || confirmText !== "delete") return;
      setIsHardDeleting(true);
      try {
        await productsService.hardDeleteProduct(hardDeleteTarget._id);
        toast.success("Product permanently deleted");
        setProducts((prev) =>
          prev.filter((p) => p._id !== hardDeleteTarget._id)
        );
        closeHardDelete();
      } catch (error) {
        toast.error("Failed to permanently delete product");
      } finally {
        setIsHardDeleting(false);
      }
    };

    const handleIsDeletedChange = (value: "false" | "true") => {
      setIsDeleted(value);
      resetToFirstPage();
    };

    return (
      <div>
        {/* Active / Deleted toggle */}
        <div className="mb-6">
          <div
            className="inline-flex items-center rounded-lg p-1"
            style={{ backgroundColor: colors.accentLight }}
          >
            {(
              [
                { value: "false", label: "Active" },
                { value: "true", label: "Deleted" },
              ] as const
            ).map((option) => {
              const active = isDeleted === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleIsDeletedChange(option.value)}
                  className="px-5 py-1.5 rounded-md text-sm font-medium transition-colors"
                  style={
                    active
                      ? { backgroundColor: colors.brown, color: "white" }
                      : {
                          backgroundColor: "transparent",
                          color: colors.textSecondary,
                        }
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <ProductFilters
          categories={categories}
          search={searchTerm}
          category={category}
          isBestSeller={isBestSeller}
          sort={sort}
          onSearchChange={handleSearchChange}
          onCategoryChange={(v) => {
            setCategory(v);
            resetToFirstPage();
          }}
          onIsBestSellerChange={(v) => {
            setIsBestSeller(v);
            resetToFirstPage();
          }}
          onSortChange={(v) => {
            setSort(v);
            resetToFirstPage();
          }}
        />

        {isLoading ? (
          <div>Loading...</div>
        ) : !products || products.length === 0 ? (
          <div
            className="text-center py-12 px-4 border-2 border-dashed rounded-lg"
            style={{ borderColor: colors.border }}
          >
            <CubeIcon
              className="mx-auto h-16 w-16 mb-4"
              style={{ color: colors.textSecondary }}
            />
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: colors.textPrimary }}
            >
              No Products Found
            </h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              There are no products matching the current filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto min-h-[40vh]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Best Seller
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className={`hover:bg-gray-50 ${
                        product.isDeleted ? "opacity-50" : ""
                      }`}
                    >
                      {/* Product (image + name) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 relative flex-shrink-0">
                            {product.defaultImage?.mediaUrl ? (
                              <Image
                                src={product.defaultImage.mediaUrl}
                                alt={product.productName}
                                fill
                                className="rounded-md object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                                <CubeIcon className="h-6 w-6 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.productName}
                            </div>
                            {product.soldItems !== undefined && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {product.soldItems} sold
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {product.category?.categoryName || "—"}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(product.finalPrice ?? product.price)}
                          </span>
                          {product.isSale && product.salePrice ? (
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-gray-500 line-through">
                                {formatPrice(product.price)}
                              </span>
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                {product.discountPercentage ??
                                  Math.round(
                                    (1 - product.salePrice / product.price) * 100
                                  )}
                                % OFF
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.availableItems <= 0
                              ? "bg-red-100 text-red-800"
                              : product.availableItems <= 5
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {product.availableItems} units
                        </span>
                      </td>

                      {/* Best Seller */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.isBestSeller ? (
                          <span
                            className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                            style={{
                              backgroundColor: `${colors.gold}33`,
                              color: colors.accentDark,
                            }}
                          >
                            Best Seller
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Status (deleted/active) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.isDeleted ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Deleted
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => onEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        {isDeleted === "false" && (
                          <button
                            onClick={() => handleSoftDelete(product)}
                            className="text-red-600 hover:text-red-900 mr-4"
                            title="Soft delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                        {isDeleted === "true" && (
                          <button
                            onClick={() => openHardDelete(product)}
                            className="text-red-800 hover:text-red-950"
                            title="Hard delete (irreversible)"
                          >
                            <ArchiveBoxXMarkIcon className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center my-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 rounded-md text-sm"
                style={{
                  backgroundColor: currentPage === 1 ? "#eee" : colors.brown,
                  color: currentPage === 1 ? "#666" : "white",
                }}
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 rounded-md text-sm"
                style={{
                  backgroundColor:
                    currentPage === totalPages ? "#eee" : colors.brown,
                  color: currentPage === totalPages ? "#666" : "white",
                }}
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          </>
        )}

        {/* Hard delete confirmation (type-to-confirm) */}
        <Dialog
          open={!!hardDeleteTarget}
          onClose={closeHardDelete}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

            <div className="relative bg-white rounded-lg w-full max-w-md mx-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title
                  className="text-xl font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Hard Delete Product
                </Dialog.Title>
                <button
                  onClick={closeHardDelete}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-800">
                  This will permanently delete the product and all its images.
                  This is irreversible.
                </p>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                Type{" "}
                <span className="font-semibold text-gray-900">delete</span> to
                confirm.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="delete"
                autoFocus
                className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown mb-4"
              />

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeHardDelete}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmHardDelete}
                  disabled={confirmText !== "delete" || isHardDeleting}
                  className="px-4 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#B91C1C" }}
                >
                  {isHardDeleting ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
);

ProductList.displayName = "ProductList";
export default ProductList;
