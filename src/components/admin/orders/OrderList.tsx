"use client";

import { useEffect, useMemo, useState } from "react";
import { ShoppingBagIcon, CubeIcon } from "@heroicons/react/24/outline";
import { format, isToday } from "date-fns";
import { formatEGP } from "@/utils/format";
import {
  ORDER_STATUSES,
  OrderStatus,
  AdminOrdersQuery,
} from "@/types/admin-order.types";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { getApiErrorMessage } from "@/utils/apiError";
import { ORDER_STATUS_LABELS, shortOrderId, orderTotal } from "./orderStatus";
import {
  PageHeader,
  TableShell,
  Thead,
  Tbody,
  Th,
  Td,
  Tr,
  Thumbnail,
  StatusBadge,
  SearchInput,
  Pagination,
  SkeletonTable,
  EmptyState,
} from "@/components/admin/ui";

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
    <div>
      <PageHeader
        title="Orders"
        description="Filter by status, drill in to confirm, ship, or cancel an order."
      />

      {/* Filter tabs (pill group) + search */}
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-admin-hairline bg-admin-surface p-1">
          {FILTER_TABS.map((tab) => {
            const active = status === tab.value;
            const count = tabCount(tab.value);
            return (
              <button
                key={tab.value || "all"}
                type="button"
                onClick={() => selectTab(tab.value)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-admin-brown text-admin-on-accent"
                    : "text-admin-ink-muted hover:bg-admin-surface-muted"
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`tabular inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                      active
                        ? "bg-white/20 text-admin-on-accent"
                        : "bg-admin-surface-muted text-admin-ink-muted"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="w-full xl:ml-auto xl:w-72">
          <SearchInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by order number…"
            ariaLabel="Search orders"
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-xl bg-admin-surface shadow-admin-card ring-1 ring-admin-hairline/60 md:grid-cols-4">
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
        <EmptyState
          icon={ShoppingBagIcon}
          title="Couldn’t load orders"
          description={getApiErrorMessage(error, "Failed to fetch orders")}
        />
      ) : isLoading ? (
        <SkeletonTable rows={8} cols={5} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBagIcon}
          title="No orders found"
          description="No orders match the current filters."
        />
      ) : (
        <div style={{ opacity: isFetching ? 0.6 : 1 }}>
          <TableShell>
            <Thead>
              <tr>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th className="text-right">Total</Th>
              </tr>
            </Thead>
            <Tbody>
              {orders.map((order) => {
                const firstLine = order.products?.[0];
                return (
                  <Tr
                    key={order._id}
                    onClick={() => onViewDetails(order._id)}
                    className="cursor-pointer"
                  >
                    {/* Order (number + first item thumb) */}
                    <Td className="whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Thumbnail
                          src={firstLine?.productId?.defaultImage?.mediaUrl}
                          alt={firstLine?.productName ?? "Order item"}
                          className="h-9 w-9"
                          icon={CubeIcon}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(order._id);
                          }}
                          aria-label={`View order #${shortOrderId(order._id)}`}
                          className="tabular text-sm font-semibold text-admin-heading hover:text-admin-brown"
                        >
                          #{shortOrderId(order._id)}
                        </button>
                      </div>
                    </Td>

                    {/* Customer */}
                    <Td className="whitespace-nowrap">
                      {order.userInformation ? (
                        <span className="text-admin-ink">
                          {order.userInformation.firstName}{" "}
                          {order.userInformation.lastName}
                        </span>
                      ) : (
                        <span className="text-admin-ink-muted">—</span>
                      )}
                    </Td>

                    {/* Date */}
                    <Td className="tabular whitespace-nowrap text-admin-ink-muted">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </Td>

                    {/* Status */}
                    <Td className="whitespace-nowrap">
                      <StatusBadge
                        status={order.status}
                        label={ORDER_STATUS_LABELS[order.status]}
                      />
                    </Td>

                    {/* Total */}
                    <Td className="tabular whitespace-nowrap text-right font-semibold text-admin-ink">
                      {formatEGP(orderTotal(order))}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </TableShell>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
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
    <div className={`px-6 py-6 ${divider ? "border-l border-admin-hairline" : ""}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-admin-ink-muted">
        {label}
      </div>
      <div
        className={`tabular mt-1 text-2xl font-semibold ${
          attention ? "text-admin-brown" : "text-admin-heading"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
