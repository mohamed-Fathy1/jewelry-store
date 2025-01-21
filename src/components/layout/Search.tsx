"use client";

import { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import { searchService } from "@/services/search.service";
import { Product } from "@/types/product.types";
import Link from "next/link";
import Image from "next/image";
import { useDebounce } from "@/hooks/useDebounce";
import { productService } from "@/services/product.service";

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Search({ isOpen, onClose }: SearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchTerm, 200);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const searchProducts = async () => {
      if (debouncedSearch.length < 1) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await productService.searchProducts(debouncedSearch);
        if (response.success) {
          setResults(response.data.products);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
  }, [debouncedSearch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <div
        ref={searchRef}
        className="w-full max-w-2xl mx-4 rounded-lg shadow-xl"
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="p-4 flex items-center gap-3 border-b"
          style={{ borderColor: colors.border }}
        >
          <SearchIcon
            className="w-5 h-5"
            style={{ color: colors.textSecondary }}
          />
          <input
            type="text"
            placeholder="Search for jewelry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-lg"
            style={{
              backgroundColor: colors.background,
              color: colors.textPrimary,
            }}
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-sm px-3 py-1 rounded-md"
            style={{ color: colors.textSecondary }}
          >
            ESC
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((product) => (
                <Link
                  key={product._id}
                  href={`/product/${product._id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-2 rounded-md hover:bg-opacity-50 transition-colors duration-200"
                  style={{ backgroundColor: colors.background }}
                >
                  <Image
                    src={product.defaultImage.mediaUrl}
                    alt={product.productName}
                    width={50}
                    height={50}
                    className="rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h4 style={{ color: colors.textPrimary }}>
                      {product.productName}
                    </h4>
                    <p style={{ color: colors.textSecondary }}>
                      {typeof product.category === "object"
                        ? product.category.categoryName
                        : ""}
                    </p>
                  </div>
                  <p
                    className="font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    EGP {product.price.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : searchTerm ? (
            <div
              className="p-8 text-center"
              style={{ color: colors.textSecondary }}
            >
              No results found for &quot;{searchTerm}&quot;
            </div>
          ) : (
            <div
              className="p-8 text-center"
              style={{ color: colors.textSecondary }}
            >
              Start typing to search...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
