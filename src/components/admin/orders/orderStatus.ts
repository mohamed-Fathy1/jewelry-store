import {
  EyeIcon,
  CheckIcon,
  ShoppingBagIcon,
  TruckIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { Order, OrderStatus } from "@/types/admin-order.types";

// Human label per status (single source for list, badge, dropdown, stepper).
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  under_review: "Under review",
  confirmed: "Confirmed",
  ordered: "Ordered",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  deleted: "Deleted",
};

// Badge appearance. `confirmed` uses the themable primary tint (per design
// spec); the rest use fixed semantic tones (green/red/amber/gray).
//  - style: inline style (CSS vars)   - className: tailwind utility classes
export const ORDER_STATUS_BADGE: Record<
  OrderStatus,
  { className?: string; style?: React.CSSProperties }
> = {
  under_review: { className: "bg-amber-100 text-amber-800" },
  confirmed: {
    style: {
      backgroundColor: "var(--color-primary-light)",
      color: "var(--color-primary-text)",
    },
  },
  ordered: { className: "bg-blue-100 text-blue-800" },
  shipped: { className: "bg-green-100 text-green-700" },
  delivered: { className: "bg-green-200 text-green-900" },
  cancelled: { className: "bg-red-100 text-red-800" },
  deleted: { className: "bg-gray-200 text-gray-700" },
};

export function formatOrderStatus(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

// Short order number shown in the UI = last 8 chars of the Mongo _id.
export function shortOrderId(id: string): string {
  return id.slice(-8);
}

// Some orders come back with subTotal/totalAmount as 0; fall back to summing
// the product lines so totals are never shown as 0 when items exist.
export function orderSubtotal(order: Order): number {
  if (order.subTotal) return order.subTotal;
  return (order.products ?? []).reduce(
    (sum, line) => sum + (line.totalPrice ?? 0),
    0
  );
}

export function orderTotal(order: Order): number {
  if (order.totalAmount) return order.totalAmount;
  return (
    orderSubtotal(order) -
    (order.discount ?? 0) +
    (order.freeShipping ? 0 : order.shippingCost ?? 0)
  );
}

// Linear progress flow for the detail stepper. cancelled/deleted are NOT part
// of the flow (handled separately as a terminal banner).
export const ORDER_FLOW = [
  { status: "under_review", label: "Under review", icon: EyeIcon },
  { status: "confirmed", label: "Confirmed", icon: CheckIcon },
  { status: "ordered", label: "Ordered", icon: ShoppingBagIcon },
  { status: "shipped", label: "Shipped", icon: TruckIcon },
  { status: "delivered", label: "Delivered", icon: ArchiveBoxIcon },
] as const;

export const TERMINAL_STATUSES: OrderStatus[] = ["cancelled", "deleted"];

export function isTerminalStatus(status: OrderStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

// Index of a status within the linear flow (-1 for terminal statuses).
export function flowIndex(status: OrderStatus): number {
  return ORDER_FLOW.findIndex((s) => s.status === status);
}

// Next status in the flow, or null if at the end / terminal.
export function nextFlowStatus(status: OrderStatus): OrderStatus | null {
  const i = flowIndex(status);
  if (i === -1 || i >= ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[i + 1].status;
}
