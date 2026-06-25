"use client";

import { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon as SearchIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Product } from "@/types/product.types";
import { useDebounce } from "@/hooks/useDebounce";
import { productService } from "@/services/product.service";
import SmartImage from "@/components/ui/SmartImage";

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Search({ isOpen, onClose }: SearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(async () => {
    if (searchTerm.trim().length < 1) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await productService.searchProducts(searchTerm);
      if (response.success) {
        const prods = response.data?.products as unknown;
        setResults(
          Array.isArray(prods)
            ? (prods as Product[])
            : ((prods as { data?: Product[] })?.data ?? [])
        );
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, 200);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
      clearTimeout(t);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/40 px-4 pt-[15vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
    >
      <div
        ref={panelRef}
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-surface shadow-card-hover ring-1 ring-hairline"
      >
        <div className="flex items-center gap-3 border-b border-hairline px-5 py-4">
          <SearchIcon className="h-5 w-5 text-ink-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            placeholder="Search for jewelry…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            spellCheck={false}
            aria-label="Search for jewelry"
            className="flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-subtle"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="grid h-8 w-8 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[26rem] overflow-y-auto overscroll-contain">
          {isLoading ? (
            <div className="space-y-3 p-4" aria-live="polite">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex animate-pulse items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-surface-sunken" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded bg-surface-sunken" />
                    <div className="h-3 w-1/3 rounded bg-surface-sunken" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <ul className="p-2">
              {results.map((product) => (
                <li key={product._id}>
                  <Link
                    href={`/product/${product._id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 rounded-xl p-2.5 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                      <SmartImage
                        src={product.defaultImage?.mediaUrl}
                        alt={product.productName}
                        fill
                        sizes="56px"
                        className="object-cover"
                        fallbackLabel={product.productName?.charAt(0)}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {product.productName}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        {typeof product.category === "object"
                          ? product.category?.categoryName
                          : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-heading">
                      EGP{" "}
                      {(product.salePrice || product.price)?.toLocaleString()}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : searchTerm ? (
            <div className="px-8 py-12 text-center text-sm text-ink-muted">
              No results for &ldquo;{searchTerm}&rdquo;
            </div>
          ) : (
            <div className="px-8 py-12 text-center text-sm text-ink-muted">
              Start typing to search the collection.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
