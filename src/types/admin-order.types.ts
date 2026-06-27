// Types for the Admin Orders API (mounted at /admin/orders).
// Source of truth: ADMIN_ORDERS_API.md + Orders_Admin.postman_collection.json.
// Kept separate from the user-facing `order.types.ts` so the customer flow is
// unaffected.

// ---------------------------------------------------------------------------
// Order status lifecycle (§2 of the spec). These are the ONLY valid statuses.
// ---------------------------------------------------------------------------
export const ORDER_STATUSES = [
  "under_review",
  "confirmed",
  "ordered",
  "shipped",
  "delivered",
  "cancelled",
  "deleted",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// The two statuses that restore stock server-side. "cancelled" also emails admins.
export const STOCK_AFFECTING_STATUSES: OrderStatus[] = ["cancelled", "deleted"];

// ---------------------------------------------------------------------------
// Order object shape (§4 of the spec).
// ---------------------------------------------------------------------------
export interface OrderMedia {
  mediaUrl: string;
  mediaId: string;
}

export interface OrderUserInformation {
  firstName: string;
  lastName: string;
  address: string;
  primaryPhone: string;
  secondaryPhone?: string;
  country?: string;
  postalCode?: string;
}

export interface OrderShipping {
  name: string;
  cost: number;
}

// `productId` is populated by the server. On GET /all only `defaultImage` is
// present; on GET /:orderId `productName` is also populated.
export interface OrderProductRef {
  _id: string;
  defaultImage?: OrderMedia;
  productName?: string;
}

export interface OrderProductLine {
  productId: OrderProductRef;
  variantId: string;
  quantity: number;
  productName: string; // snapshot string on the line
  itemPrice: number; // unit price after flash discount (0 for free gift)
  totalPrice: number;
  size: string;
  color: string;
  isFreeGift: boolean;
}

export interface Order {
  _id: string;
  user: string;
  userInformation: OrderUserInformation;
  shipping: OrderShipping;
  products: OrderProductLine[];
  subTotal: number;
  discount: number;
  freeShipping: boolean;
  shippingCost: number;
  totalAmount: number;
  appliedOffer: string | null;
  appliedFlashOffers: string[];
  status: OrderStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// ---------------------------------------------------------------------------
// Request inputs
// ---------------------------------------------------------------------------
export interface AdminOrdersQuery {
  page: number; // REQUIRED by the API (limit is fixed at 20 server-side)
  status?: OrderStatus; // optional exact-status filter
  orderId?: string; // optional SUFFIX match on _id (e.g. last 8 chars)
}

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
}

// ---------------------------------------------------------------------------
// Response envelopes ({ statusCode, data, message, success })
// ---------------------------------------------------------------------------
export interface AdminOrdersListData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  orders: Order[];
}

export interface AdminOrdersListResponse {
  statusCode: number;
  data: AdminOrdersListData;
  message: string;
  success: boolean;
}

export interface AdminOrderResponse {
  statusCode: number;
  data: { order: Order };
  message: string;
  success: boolean;
}
