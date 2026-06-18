"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { format, isToday } from "date-fns";
import { formatEGP } from "@/utils/format";
import {
  ORDER_STATUSES,
  OrderStatus,
  AdminOrdersQuery,
} from "@/types/admin-order.types";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { getApiErrorMessage } from "@/utils/apiError";
import OrderStatusBadge from "./OrderStatusBadge";
import { ORDER_STATUS_LABELS, shortOrderId, orderTotal } from "./orderStatus";

interface OrderListProps {
  onViewDetails: (orderId: string) => void;
}

// "" = the "All" tab (no status param sent).
const FILTER_TABS: { value: "" | OrderStatus; label: string }[] = [
  { value: "", label: "All" },
  ...ORDER_STATUSES.map((value) => ({
    value,
    label: ORDER_STATUS_LABELS[value],
  })),
];

// Statuses that still need an admin to act.
const PENDING_STATUSES: OrderStatus[] = ["under_review", "confirmed", "ordered"];

export default function OrderList({ onViewDetails }: OrderListProps) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [orderId, setOrderId] = useState("");

  // Debounce the search box into the applied orderId filter; reset to page 1.
  useEffect(() => {
    const t = setTimeout(() => {
      setOrderId(searchInput.replace(/^#/, "").trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const filters: AdminOrdersQuery = useMemo(
    () => ({
      page,
      status: status || undefined,
      orderId: orderId || undefined,
    }),
    [page, status, orderId]
  );

  const { data, isLoading, isError, error, isFetching } =
    useAdminOrders(filters);

  const orders = data?.data?.orders ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const totalItems = data?.data?.totalItems ?? 0;
  const currentPage = data?.data?.currentPage ?? page;

  // Per-tab counts derived from the loaded page (the API has no per-status
  // aggregate). Inactive tabs simply hide the badge when 0.
  const pageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
    return counts;
  }, [orders]);

  const tabCount = (value: "" | OrderStatus): number => {
    if (value === "") return totalItems;
    return pageCounts[value] ?? 0;
  };

  // Stats bar (scoped to the current page).
  const stats = useMemo(() => {
    const pending = orders.filter((o) =>
      PENDING_STATUSES.includes(o.status)
    ).length;
    const shippedToday = orders.filter(
      (o) => o.status === "shipped" && isToday(new Date(o.updatedAt))
    ).length;
    const revenue = orders
      .filter((o) => o.status !== "cancelled" && o.status !== "deleted")
      .reduce((sum, o) => sum + orderTotal(o), 0);
    return { onPage: orders.length, pending, shippedToday, revenue };
  }, [orders]);

  const selectTab = (value: "" | OrderStatus) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div style={{ background: "var(--color-bg-page)" }}>
      {/* Header */}
      <header className="mb-6">
        <h1
          className="italic"
          style={{
            fontSize: 32,
            fontWeight: 400,
            color: "var(--color-text-primary)",
          }}
        >
          Orders
        </h1>
        <p
          className="mt-1"
          style={{ fontSize: 13, color: "var(--color-text-muted)" }}
        >
          Filter by status, drill in to confirm, ship, or cancel an order.
        </p>
      </header>

      {/* Filter tabs (pill group) + search */}
      <div className="flex flex-col xl:flex-row xl:items-center gap-4 mb-6">
        <div
          className="inline-flex flex-wrap items-center gap-1 p-1"
          style={{
            borderRadius: 999,
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          {FILTER_TABS.map((tab) => {
            const active = status === tab.value;
            const count = tabCount(tab.value);
            return (
              <button
                key={tab.value || "all"}
                onClick={() => selectTab(tab.value)}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-colors"
                style={{
                  borderRadius: 999,
                  background: active ? "var(--color-primary)" : "transparent",
                  color: active ? "#fff" : "var(--color-text-muted)",
                }}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className="inline-flex items-center justify-center text-xs font-semibold rounded-full px-1.5 min-w-[18px] h-[18px]"
                    style={{
                      background: active
                        ? "rgba(255,255,255,0.25)"
                        : "var(--color-primary-light)",
                      color: active ? "#fff" : "var(--color-primary-text)",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative xl:ml-auto w-full xl:w-72">
          <MagnifyingGlassIcon
            className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-text-muted)" }}
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by order number"
            className="w-full pl-10 pr-4 py-2 focus:outline-none"
            style={{
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-surface)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 mb-6"
        style={{
          background: "var(--color-bg-page)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
        }}
      >
        <Stat label="On this page" value={String(stats.onPage)} />
        <Stat
          label="Pending action"
          value={String(stats.pending)}
          attention
          divider
        />
        <Stat label="Shipped today" value={String(stats.shippedToday)} divider />
        <Stat label="Revenue (page)" value={formatEGP(stats.revenue)} divider />
      </div>

      {/* List */}
      {isError ? (
        <div
          className="text-center py-12 px-4 rounded-xl"
          style={{ border: "1px solid var(--color-border)" }}
        >
          <p className="text-sm" style={{ color: "var(--color-danger)" }}>
            {getApiErrorMessage(error, "Failed to fetch orders")}
          </p>
        </div>
      ) : isLoading ? (
        <div
          className="py-12 text-center"
          style={{ color: "var(--color-text-muted)" }}
        >
          Loading orders…
        </div>
      ) : orders.length === 0 ? (
        <div
          className="text-center py-12 px-4 rounded-xl"
          style={{
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-surface)",
          }}
        >
          <ShoppingBagIcon
            className="mx-auto h-16 w-16 mb-4"
            style={{ color: "var(--color-text-muted)" }}
          />
          <h3
            className="text-lg font-medium mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            No Orders Found
          </h3>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            No orders match the current filters.
          </p>
        </div>
      ) : (
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
                  {["Order", "Customer", "Date", "Status", "Total"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left"
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--color-text-muted)",
                          textAlign: i === 4 ? "right" : "left",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const firstLine = order.products?.[0];
                  return (
                    <tr
                      key={order._id}
                      onClick={() => onViewDetails(order._id)}
                      className="cursor-pointer transition-colors hover:bg-black/[0.02]"
                      style={{ borderBottom: "1px solid var(--color-border)" }}
                    >
                      {/* Order (number + first item thumb) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 relative flex-shrink-0">
                            {firstLine?.productId?.defaultImage?.mediaUrl ? (
                              <Image
                                src={firstLine.productId.defaultImage.mediaUrl}
                                alt={firstLine.productName}
                                fill
                                className="rounded-md object-cover"
                              />
                            ) : (
                              <div
                                className="h-9 w-9 rounded-md flex items-center justify-center"
                                style={{ background: "var(--color-bg-page)" }}
                              >
                                <CubeIcon className="h-4 w-4 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            #{shortOrderId(order._id)}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.userInformation ? (
                          <span
                            className="text-sm"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {order.userInformation.firstName}{" "}
                            {order.userInformation.lastName}
                          </span>
                        ) : (
                          <span
                            className="text-sm"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            —
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatusBadge status={order.status} />
                      </td>

                      {/* Total */}
                      <td
                        className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {formatEGP(orderTotal(order))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination (server-driven, 20/page) */}
      {!isLoading && !isError && orders.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <PillButton
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Previous
          </PillButton>
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Page {currentPage} of {totalPages} · {totalItems} orders
          </span>
          <PillButton
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </PillButton>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  attention,
  divider,
}: {
  label: string;
  value: string;
  attention?: boolean;
  divider?: boolean;
}) {
  return (
    <div
      className="px-6 py-6"
      style={{
        borderLeft: divider ? "1px solid var(--color-border)" : undefined,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}
      >
        {label}
      </div>
      <div
        className="mt-1"
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: attention
            ? "var(--color-primary)"
            : "var(--color-text-primary)",
        }}
      >
        {value}
      </div>
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
