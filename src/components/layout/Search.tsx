"use client";

import { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import Link from "next/link";
import Image from "next/image";

// Mock data - replace with actual API call
const mockProducts = [
  {
    id: "1",
    name: "Diamond Pendant Necklace",
    price: 999.99,
    category: "Necklaces",
    image: "/images/IMG_2953.JPG",
  },
  {
    id: "2",
    name: "Gold Bracelet",
    price: 599.99,
    category: "Bracelets",
    image: "/images/IMG_3176.PNG",
  },
  {
    id: "3",
    name: "Pearl Earrings",
    price: 399.99,
    category: "Earrings",
    image: "/images/IMG_3177.PNG",
  },
];

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Search({ isOpen, onClose }: SearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<typeof mockProducts>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside
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

  // Handle search input
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.length > 0) {
      const filtered = mockProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(value.toLowerCase()) ||
          product.category.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

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
        {/* Search Input */}
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
            onChange={(e) => handleSearch(e.target.value)}
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

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-2">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-2 rounded-md hover:bg-opacity-50 transition-colors duration-200"
                  style={{ backgroundColor: colors.background }}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={50}
                    height={50}
                    className="rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h4 style={{ color: colors.textPrimary }}>
                      {product.name}
                    </h4>
                    <p style={{ color: colors.textSecondary }}>
                      {product.category}
                    </p>
                  </div>
                  <p
                    className="font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    ${product.price}
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
