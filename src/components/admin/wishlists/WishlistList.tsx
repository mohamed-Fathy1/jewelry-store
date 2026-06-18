"use client";

import { useState } from "react";
import Image from "next/image";
import { AxiosError } from "axios";
import { format } from "date-fns";
import {
  HeartIcon,
  CubeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useAllWishlist } from "@/hooks/useAdminWishlists";
import { WishlistEntry } from "@/types/admin-wishlist.types";
import { formatEGP } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/apiError";

export default function WishlistList() {
  // Server-side pagination: 20 items per page, driven by totalPages/currentPage.
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, isFetching } = useAllWishlist(page);

  const status = (error as AxiosError | undefined)?.response?.status;
  const entries = data?.data?.wishlist?.products ?? [];
  const totalPages = data?.data?.wishlist?.totalPages ?? 1;
  const totalItems = data?.data?.wishlist?.totalItems ?? 0;
  const currentPage = data?.data?.wishlist?.currentPage ?? page;

  // 401 is handled globally by the axios interceptor (redirect to /admin/login).
  // 403 means the account is authenticated but not allowed to view wishlists.
  if (isError && status === 403) {
    return (
      <EmptyState
        title="Not authorized"
        message="You don't have permission to view wishlists."
        danger
      />
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Failed to load wishlists"
        message={getApiErrorMessage(error, "Failed to fetch wishlists")}
        danger
      />
    );
  }

  if (isLoading) {
    return (
      <div
        className="py-12 text-center"
        style={{ color: "var(--color-text-muted)" }}
      >
        Loading wishlists…
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon
        title="No saved products"
        message="No products have been added to any wishlist yet."
      />
    );
  }

  return (
    <>
      <div
        className="overflow-hidden"
        style={{
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          opacity: isFetching ? 0.6 : 1,
        }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Product", "Customer", "Saved"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <WishlistRow key={entry._id} entry={entry} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination (server-driven, 20/page) */}
      <div className="flex justify-between items-center mt-4">
        <PillButton
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage <= 1}
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Previous
        </PillButton>
        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Page {currentPage} of {totalPages} · {totalItems} saved
        </span>
        <PillButton
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </PillButton>
      </div>
    </>
  );
}

function WishlistRow({ entry }: { entry: WishlistEntry }) {
  const product = entry.productId;
  const info = entry.userInformation;
  const outOfStock = product.availableItems === 0;

  return (
    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
      {/* Product: thumbnail + name + category + price/salePrice + stock */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 relative flex-shrink-0">
            {product.defaultImage?.mediaUrl ? (
              <Image
                src={product.defaultImage.mediaUrl}
                alt={product.productName}
                fill
                className="rounded-md object-cover"
              />
            ) : (
              <div
                className="h-12 w-12 rounded-md flex items-center justify-center"
                style={{ background: "var(--color-bg-page)" }}
              >
                <CubeIcon className="h-5 w-5 text-gray-300" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-semibold truncate"
                style={{ color: "var(--color-text-primary)" }}
              >
                {product.productName}
              </span>
              {product.isSale && (
                <span
                  className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "var(--color-danger, #dc2626)",
                    color: "#fff",
                  }}
                >
                  Sale
                </span>
              )}
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              {product.category?.categoryName ?? "—"}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {product.isSale ? (
                <>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {formatEGP(product.salePrice)}
                  </span>
                  <span
                    className="text-xs line-through"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {formatEGP(product.price)}
                  </span>
                </>
              ) : (
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {formatEGP(product.price)}
                </span>
              )}
              <span
                className="text-xs"
                style={{
                  color: outOfStock
                    ? "var(--color-danger, #dc2626)"
                    : "var(--color-text-muted)",
                }}
              >
                {outOfStock
                  ? "Out of stock"
                  : `${product.availableItems} in stock`}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Customer: name + email, phone, city + address — or "No profile". */}
      <td className="px-6 py-4 align-top">
        {info ? (
          <div className="space-y-0.5">
            <div
              className="text-sm font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              {info.firstName} {info.lastName}
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              {entry.user?.email}
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              {info.primaryPhone}
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              {[info.shipping?.category, info.address]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            <span
              className="text-sm italic"
              style={{ color: "var(--color-text-muted)" }}
            >
              No profile
            </span>
            <div
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              {entry.user?.email}
            </div>
          </div>
        )}
      </td>

      {/* Saved date (epoch ms -> formatted date). */}
      <td
        className="px-6 py-4 whitespace-nowrap text-sm align-top"
        style={{ color: "var(--color-text-muted)" }}
      >
        {format(new Date(entry.createdAt), "MMM d, yyyy")}
      </td>
    </tr>
  );
}

function EmptyState({
  title,
  message,
  icon,
  danger,
}: {
  title: string;
  message: string;
  icon?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className="text-center py-12 px-4 rounded-xl"
      style={{
        border: "1px solid var(--color-border)",
        background: "var(--color-bg-surface)",
      }}
    >
      {icon && (
        <HeartIcon
          className="mx-auto h-16 w-16 mb-4"
          style={{ color: "var(--color-text-muted)" }}
        />
      )}
      <h3
        className="text-lg font-medium mb-2"
        style={{
          color: danger ? "var(--color-danger, #dc2626)" : "var(--color-text-primary)",
        }}
      >
        {title}
      </h3>
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        {message}
      </p>
    </div>
  );
}

function PillButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        borderRadius: 999,
        border: "1px solid var(--color-border)",
        background: "var(--color-bg-surface)",
        color: "var(--color-text-primary)",
      }}
    >
      {children}
    </button>
  );
}
