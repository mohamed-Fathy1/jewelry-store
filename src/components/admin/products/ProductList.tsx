"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { colors } from "@/constants/colors";
import { formatPrice } from "@/utils/format";
import { Product } from "@/types/product.types";
import { adminService } from "@/services/admin.service";
import toast from "react-hot-toast";
import ProductFilters from "./ProductFilters";
import api from "@/lib/axios";

interface ProductListProps {
  onEdit: (product: Product) => void;
}

export interface ProductListRef {
  fetchProducts: () => Promise<void>;
}

const ProductList = forwardRef<ProductListRef, ProductListProps>(
  ({ onEdit }, ref) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [currentFilter, setCurrentFilter] = useState<
      "all" | "sale" | "soldout"
    >("all");

    const fetchProducts = async (
      page: number = currentPage,
      searchQuery?: string
    ) => {
      setIsLoading(true);
      try {
        let response;

        // If there's a search query, use search endpoint
        if (searchQuery?.trim()) {
          response = await api.get(
            `/public/product/search-product?searchQuery=${searchQuery}`
          );
          setProducts(response.data.data.products);
        }
        // Otherwise use filter endpoints
        else {
          const endpoints = {
            all: `/public/product/get-all-product?page=${page}`,
            sale: `/public/product/get-all-sale?page=${page}`,
            soldout: `/product/sold-out?page=${page}`,
            wishlisted: `/wishlist/get-all-wishlist?page=${page}`,
          };
          response = await api.get(endpoints[currentFilter]);
          if (currentFilter === "wishlisted") {
            setProducts(
              response.data.data.wishlist.products.map(
                (product: any) => product.productId
              )
            );
            setTotalPages(response.data.wishlist.totalPages);
          } else {
            setProducts(response.data.data.products.data);
            setTotalPages(response.data.data.products.totalPages);
          }
        }
      } catch (error) {
        console.log(error);

        // toast.error("Failed to fetch products");
      } finally {
        setIsLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      fetchProducts: () => fetchProducts(currentPage),
    }));

    useEffect(() => {
      fetchProducts();
    }, [currentPage, currentFilter]);

    const handleDelete = async (productId: string) => {
      if (window.confirm("Are you sure you want to delete this product?")) {
        try {
          await adminService.deleteProduct(productId);
          toast.success("Product deleted successfully");
          fetchProducts(currentPage);
        } catch (error) {
          toast.error("Failed to delete product");
        }
      }
    };

    const getStockStatus = (quantity: number) => {
      if (quantity <= 0)
        return { text: "Out of Stock", class: "bg-red-100 text-red-800" };
      if (quantity <= 5)
        return { text: "Low Stock", class: "bg-yellow-100 text-yellow-800" };
      return { text: "In Stock", class: "bg-green-100 text-green-800" };
    };

    const getProductStatus = (product: Product) => {
      if (product.isSoldOut)
        return { text: "Sold Out", class: "bg-gray-100 text-gray-800" };
      if (product.salePrice)
        return { text: "On Sale", class: "bg-blue-100 text-blue-800" };
      return { text: "Active", class: "bg-green-100 text-green-800" };
    };

    return (
      <div>
        <ProductFilters
          onSearch={fetchProducts}
          selectedFilter={currentFilter}
          onFilterChange={setCurrentFilter}
        />
        {isLoading ? (
          <div>Loading...</div>
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
                      Product Details
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Pricing
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Inventory
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
                  {products?.map((product) => {
                    const stockStatus = getStockStatus(product.availableItems);
                    const productStatus = getProductStatus(product);

                    return (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-16 w-16 relative flex-shrink-0">
                              <Image
                                src={product.defaultImage.mediaUrl}
                                alt={product.productName}
                                fill
                                className="rounded-md object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                {product.productName}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center">
                                {/* <span className="font-medium">SKU:</span>
                                <span className="ml-1">{product.}</span> */}
                              </div>
                              {product.category && (
                                <div className="text-xs text-gray-500 flex items-center mt-1">
                                  <span className="font-medium">Category:</span>
                                  <span className="ml-1">
                                    {product.category.categoryName}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {formatPrice(product.price)}
                            </div>
                            {product.salePrice ? (
                              <div className="flex items-center mt-1">
                                <span className="text-xs text-gray-500 line-through">
                                  {formatPrice(product.salePrice)}
                                </span>
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                  {Math.round(
                                    (1 - product.salePrice / product.price) *
                                      100
                                  )}
                                  % OFF
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.class}`}
                            >
                              {stockStatus.text}
                            </span>
                            <span className="text-sm text-gray-500 mt-1">
                              {product.availableItems} units
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${productStatus.class}`}
                          >
                            {productStatus.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => onEdit(product)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
      </div>
    );
  }
);

ProductList.displayName = "ProductList";
export default ProductList;
