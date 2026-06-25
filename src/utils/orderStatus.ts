// Single source of truth for customer-facing order status presentation.
// Brand-palette only — no off-palette greens/reds or raw hex. Semantic signal
// is carried by the label and a restrained warm treatment (quiet luxury):
// in-progress → soft champagne, delivered → committed brown, ended → muted.

export const ORDER_STATUS_FLOW = [
  "under_review",
  "confirmed",
  "ordered",
  "shipped",
  "delivered",
] as const;

export interface OrderStatusMeta {
  label: string;
  description: string;
  /** Tailwind token classes for the status pill (background + text). */
  badgeClass: string;
}

const STATUS_META: Record<string, OrderStatusMeta> = {
  under_review: {
    label: "Under Review",
    description: "Order is being reviewed",
    badgeClass: "bg-accent-soft text-heading",
  },
  confirmed: {
    label: "Confirmed",
    description: "Order has been confirmed",
    badgeClass: "bg-accent-soft text-heading",
  },
  ordered: {
    label: "Processing",
    description: "Order is being processed",
    badgeClass: "bg-accent-soft text-heading",
  },
  shipped: {
    label: "Shipped",
    description: "Package is on its way",
    badgeClass: "bg-accent-soft text-heading",
  },
  delivered: {
    label: "Delivered",
    description: "Package has been delivered",
    badgeClass: "bg-primary text-on-primary",
  },
  cancelled: {
    label: "Cancelled",
    description: "Order has been cancelled",
    badgeClass: "bg-surface-sunken text-ink-muted",
  },
  deleted: {
    label: "Deleted",
    description: "Order has been removed",
    badgeClass: "bg-surface-sunken text-ink-muted",
  },
};

export const getOrderStatusMeta = (status: string): OrderStatusMeta =>
  STATUS_META[status?.toLowerCase()] ?? STATUS_META.under_review;

/** Position within ORDER_STATUS_FLOW, or -1 for terminal/unknown statuses. */
export const getOrderStatusIndex = (status: string): number =>
  ORDER_STATUS_FLOW.indexOf(status?.toLowerCase() as (typeof ORDER_STATUS_FLOW)[number]);
