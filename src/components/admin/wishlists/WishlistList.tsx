"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { colors } from "@/constants/colors";
import { WishlistItem } from "@/types/wishlist.types";
import { adminService } from "@/services/admin.service";
import toast from "react-hot-toast";
import { formatPrice } from "@/utils/format";
import { format } from "date-fns";

export default function WishlistList() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWishlists = async (page: number) => {
    try {
      const response = await adminService.getWishlists(page);
      setWishlistItems(response.data.wishlist.products);
      setTotalPages(response.data.wishlist.totalPages);
    } catch (error) {
      toast.error("Failed to fetch wishlists");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlists(currentPage);
  }, [currentPage]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 overflow-x-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Added Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {wishlistItems.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 relative flex-shrink-0">
                      <Image
                        src={item.productId.defaultImage.mediaUrl}
                        alt={item.productId.productName}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <Link
                        href={`/products/${item.productId._id}`}
                        className="text-sm font-medium hover:text-brown"
                        style={{ color: colors.textPrimary }}
                      >
                        {item.productId.productName}
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      <span className="font-medium">Avalable: </span>
                      {item.productId.availableItems}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      {/* <span className="font-medium">SKU:</span>
                                <span className="ml-1">{product.}</span> */}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <span className="font-medium">Sold:</span>
                      <span className="ml-1">{item.productId.soldItems}</span>
                    </div>
                  </div>{" "}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm"
                    style={{ color: colors.textPrimary }}
                  >
                    {item?.user?.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {format(new Date(item.createdAt), "MMM d, yyyy")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    {formatPrice(item.productId.price)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center px-6 py-3 border-t">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md text-sm ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          style={{ backgroundColor: colors.brown, color: colors.textLight }}
        >
          Previous
        </button>
        <span className="text-sm" style={{ color: colors.textSecondary }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md text-sm ${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
          style={{ backgroundColor: colors.brown, color: colors.textLight }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
