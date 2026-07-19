"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { HeartIcon, CubeIcon } from "@heroicons/react/24/outline";
import { useAllWishlist } from "@/hooks/useAdminWishlists";
import { WishlistEntry } from "@/types/admin-wishlist.types";
import { formatEGP } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/apiError";
import { customerName } from "@/utils/customerName";
import {
  TableShell,
  Thead,
  Tbody,
  Th,
  Td,
  Tr,
  Thumbnail,
  Pagination,
  SkeletonTable,
  EmptyState,
} from "@/components/admin/ui";

export default function WishlistList() {
  // Server-side pagination: 20 items per page, driven by totalPages/currentPage.
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useAllWishlist(page);

  const status = (error as AxiosError | undefined)?.response?.status;
  const entries = data?.data?.wishlist?.products ?? [];
  const totalPages = data?.data?.wishlist?.totalPages ?? 1;
  const currentPage = data?.data?.wishlist?.currentPage ?? page;

  // 401 is handled globally by the axios interceptor (redirect to /admin/login).
  // 403 means the account is authenticated but not allowed to view wishlists.
  if (isError && status === 403) {
    return (
      <EmptyState
        icon={HeartIcon}
        title="Not authorized"
        description="You don't have permission to view wishlists."
      />
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={HeartIcon}
        title="Failed to load wishlists"
        description={getApiErrorMessage(error, "Failed to fetch wishlists")}
      />
    );
  }

  if (isLoading) {
    return <SkeletonTable rows={8} cols={3} />;
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={HeartIcon}
        title="No wishlist items"
        description="Nothing has been saved yet."
      />
    );
  }

  return (
    <>
      <TableShell>
        <Thead>
          <tr>
            <Th>Product</Th>
            <Th>Customer</Th>
            <Th>Saved</Th>
          </tr>
        </Thead>
        <Tbody>
          {entries.map((entry) => (
            <WishlistRow key={entry._id} entry={entry} />
          ))}
        </Tbody>
      </TableShell>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </>
  );
}

function WishlistRow({ entry }: { entry: WishlistEntry }) {
  const product = entry.productId;
  const info = entry.userInformation;
  const outOfStock = product.availableItems === 0;

  return (
    <Tr>
      {/* Product: thumbnail + name + category + price/salePrice + stock */}
      <Td>
        <div className="flex items-center gap-3">
          <Thumbnail
            src={product.defaultImage?.mediaUrl}
            alt={product.productName}
            icon={CubeIcon}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-admin-ink">
                {product.productName}
              </span>
              {product.isSale && (
                <span className="inline-flex items-center rounded-full bg-admin-danger px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-admin-on-accent">
                  Sale
                </span>
              )}
            </div>
            <div className="mt-0.5 text-xs text-admin-ink-muted">
              {product.category?.categoryName ?? "—"}
            </div>
            <div className="mt-1 flex items-center gap-2">
              {product.isSale ? (
                <>
                  <span className="tabular text-sm font-semibold text-admin-ink">
                    {formatEGP(product.salePrice)}
                  </span>
                  <span className="tabular text-xs text-admin-ink-muted line-through">
                    {formatEGP(product.price)}
                  </span>
                </>
              ) : (
                <span className="tabular text-sm font-semibold text-admin-ink">
                  {formatEGP(product.price)}
                </span>
              )}
              <span
                className={`tabular text-xs ${
                  outOfStock ? "text-admin-danger" : "text-admin-ink-muted"
                }`}
              >
                {outOfStock
                  ? "Out of stock"
                  : `${product.availableItems} in stock`}
              </span>
            </div>
          </div>
        </div>
      </Td>

      {/* Customer: name + email, phone, city + address — or "No profile". */}
      <Td className="align-top">
        {info ? (
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-admin-ink">
              {customerName(info)}
            </div>
            <div className="text-xs text-admin-ink-muted">
              {entry.user?.email}
            </div>
            <div className="text-xs text-admin-ink-muted">
              {info.primaryPhone}
            </div>
            <div className="text-xs text-admin-ink-muted">
              {[info.shipping?.category, info.address]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            <span className="text-sm italic text-admin-ink-muted">
              No profile
            </span>
            <div className="text-xs text-admin-ink-muted">
              {entry.user?.email}
            </div>
          </div>
        )}
      </Td>

      {/* Saved date (epoch ms -> formatted date). */}
      <Td className="whitespace-nowrap align-top tabular text-admin-ink-muted">
        {format(new Date(entry.createdAt), "MMM d, yyyy")}
      </Td>
    </Tr>
  );
}
