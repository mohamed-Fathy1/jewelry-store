"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import toast from "react-hot-toast";
import { wishlistService } from "@/services/wishlist.service";
import { useWishlist } from "@/contexts/WishlistContext";

export default function AccountWishlist() {
  const { toggleWishlist } = useWishlist();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const result = await wishlistService.getAllWishlist(currentPage);
        if (result.success) {
          setTotalPages(result.data.wishlist.totalPages);
          setWishlist(result.data.wishlist.products);
        } else {
          console.error("Failed to fetch wishlist:", result.message);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [currentPage]);

  const removeFromWishlist = async (id: string) => {
    setWishlist((prev) => {
      return prev.filter((item) => item.productId._id !== id);
    });
  };

  const addToCart = (name: string) => {
    toast.success(`${name} added to cart`);
  };

  if (loading) {
    return <div>Loading wishlist...</div>;
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-12">
        <h2
          className="text-lg font-medium"
          style={{ color: colors.textPrimary }}
        >
          Your Wishlist is Empty
        </h2>
        <p className="mt-2" style={{ color: colors.textSecondary }}>
          You have not added any items to your wishlist yet.
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-block px-4 py-2 rounded-md"
          style={{
            backgroundColor: colors.brown,
            color: colors.textLight,
          }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div
            key={item._id}
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: colors.background }}
          >
            <div className="aspect-square relative">
              <Image
                src={item.productId.defaultImage.mediaUrl}
                alt={item.productId.productName}
                fill
                className="object-cover"
              />
              {!item.productId.isSale && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <span
                    className="px-4 py-2 rounded-md text-sm font-medium"
                    style={{ color: colors.textLight }}
                  >
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <Link href={`/product/${item.productId._id}`}>
                <h3
                  className="text-lg font-medium mb-1"
                  style={{ color: colors.textPrimary }}
                >
                  {item.productId.productName}
                </h3>
              </Link>
              <p className="mb-2" style={{ color: colors.textSecondary }}>
                {item.productId.category}
              </p>
              <p
                className="text-lg font-semibold mb-4"
                style={{ color: colors.textPrimary }}
              >
                ${item.productId.price.toFixed(2)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => addToCart(item.productId.productName)}
                  disabled={!item.productId.isSale}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors duration-200 disabled:opacity-50"
                  style={{
                    backgroundColor: colors.brown,
                    color: colors.textLight,
                  }}
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    removeFromWishlist(item.productId._id);
                    toggleWishlist(item.productId._id);
                  }}
                  className="p-2 rounded-md border transition-colors duration-200"
                  style={{
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-md bg-gray-300 text-gray-700 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-md bg-gray-300 text-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
