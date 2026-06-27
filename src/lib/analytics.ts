"use client";

// PHIPA-safe, typed Meta Pixel helpers centralized here.

type AnalyticsPrimitive = string | number | boolean;
type AnalyticsValue =
  | AnalyticsPrimitive
  | AnalyticsPrimitive[]
  | AnalyticsCartItem[];

type AnalyticsCartItem = {
  id: string;
  quantity: number;
  price: number;
};

export type BaseCartPayload = {
  contents: AnalyticsCartItem[];
  numItems: number;
  value: number;
  currency: string;
};

declare global {
  interface Window {
    fbq?: (
      method: "track" | "trackCustom",
      event: string,
      params?: FbqParams
    ) => void;
    gtag?: (
      command: "event" | "config" | "js" | "set",
      targetOrName: string | Date,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

type FbqParams = Record<string, AnalyticsValue>;

// ─── Google Analytics 4 (gtag) ───────────────────────────────────────────────
// The gtag stub is installed synchronously in the document <head> (see
// app/layout.tsx), so window.gtag exists before any of these helpers run and
// queues events into dataLayer until gtag.js finishes loading.
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-W105BCK4MN";

type GaItem = {
  item_id: string;
  item_name?: string;
  price: number;
  quantity: number;
};

function hasGtag(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

function gaEvent(name: string, params: Record<string, unknown>): void {
  if (!hasGtag()) return;
  window.gtag!("event", name, params);
}

function toGaItems(contents: AnalyticsCartItem[]): GaItem[] {
  return sanitizeContents(contents).map((c) => ({
    item_id: c.id,
    price: c.price,
    quantity: c.quantity,
  }));
}

/** Single GA4 page_view — fired on every client route change (see the route
 *  tracker mounted in the layout). Config sets send_page_view:false so this is
 *  the sole source of page_views and they aren't double-counted. */
export function trackPageView(path: string): void {
  if (!hasGtag()) return;
  window.gtag!("event", "page_view", {
    page_path: path,
    page_location:
      typeof window !== "undefined" ? window.location.href : path,
    page_title: typeof document !== "undefined" ? document.title : undefined,
  });
}

export type ProductEventPayload = {
  id: string;
  name?: string;
  price: number;
  quantity?: number;
  currency?: string;
};

function hasFbq(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.fbq);
}

type FbqMethod = "track" | "trackCustom";

const pendingQueue: Array<{
  method: FbqMethod;
  event: string;
  payload: FbqParams;
}> = [];
let checkTimer: number | undefined;
const CHECK_INTERVAL_MS = 250;
const CHECK_TIMEOUT_MS = 5000;
let startedAt = 0;

function startFbqWatcher(): void {
  if (typeof window === "undefined") return;
  if (checkTimer !== undefined) return;
  startedAt = Date.now();
  checkTimer = window.setInterval(() => {
    if (hasFbq() || Date.now() - startedAt > CHECK_TIMEOUT_MS) {
      if (checkTimer !== undefined) {
        clearInterval(checkTimer);
        checkTimer = undefined;
      }
      if (hasFbq()) {
        // Flush queued events
        for (const item of pendingQueue.splice(0, pendingQueue.length)) {
          window.fbq!(item.method, item.event, item.payload);
        }
      } else {
        // Give up quietly after timeout
        pendingQueue.splice(0, pendingQueue.length);
      }
    }
  }, CHECK_INTERVAL_MS);
}

function emit(method: FbqMethod, eventName: string, payload: FbqParams): void {
  if (hasFbq()) {
    window.fbq!(method, eventName, payload);
    return;
  }
  pendingQueue.push({ method, event: eventName, payload });
  startFbqWatcher();
}

function trackStandard(eventName: string, payload: FbqParams): void {
  emit("track", eventName, payload);
}

function trackCustom(eventName: string, payload: FbqParams): void {
  emit("trackCustom", eventName, payload);
}

function clampNumber(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round((n + Number.EPSILON) * 100) / 100);
}

function sanitizeContents(contents: AnalyticsCartItem[]): AnalyticsCartItem[] {
  return contents
    .filter((c) => Boolean(c) && typeof c.id === "string")
    .map((c) => ({
      id: c.id,
      quantity: Math.max(1, c.quantity | 0),
      price: clampNumber(c.price),
    }));
}

export function trackInitiateCheckout(args: BaseCartPayload): void {
  const contents = sanitizeContents(args.contents);
  const numItems = Math.max(0, args.numItems | 0);
  const value = clampNumber(args.value);
  const currency = args.currency || "EGP";

  trackStandard("InitiateCheckout", {
    content_name: "Checkout Start",
    content_category: "Checkout",
    currency,
    num_items: numItems,
    value,
    contents,
    content_type: "product",
  });
  gaEvent("begin_checkout", { currency, value, items: toGaItems(contents) });
}

export function trackCheckoutStep(
  step: 1 | 2 | 3,
  args: BaseCartPayload & { stepName: "shipping" | "payment" | "confirmation" }
): void {
  const contents = sanitizeContents(args.contents);
  const numItems = Math.max(0, args.numItems | 0);
  const value = clampNumber(args.value);
  const currency = args.currency || "EGP";

  trackCustom("CheckoutStep", {
    step,
    step_name: args.stepName,
    currency,
    num_items: numItems,
    value,
    contents,
  });
  gaEvent("checkout_progress", {
    step,
    step_name: args.stepName,
    currency,
    value,
    items: toGaItems(contents),
  });
}

export function trackAddShippingInfo(
  args: { shippingMethod: string; shippingCost: number } & BaseCartPayload
): void {
  const contents = sanitizeContents(args.contents);
  const numItems = Math.max(0, args.numItems | 0);
  const value = clampNumber(args.value);
  const shippingCost = clampNumber(args.shippingCost);
  const currency = args.currency || "EGP";

  trackStandard("AddShippingInfo", {
    currency,
    value,
    shipping_method: args.shippingMethod || "standard",
    shipping_cost: shippingCost,
    num_items: numItems,
    contents,
  });
  gaEvent("add_shipping_info", {
    currency,
    value,
    shipping_tier: args.shippingMethod || "standard",
    items: toGaItems(contents),
  });
}

export function trackAddPaymentInfo(
  args: { paymentMethod: string } & BaseCartPayload
): void {
  const contents = sanitizeContents(args.contents);
  const numItems = Math.max(0, args.numItems | 0);
  const value = clampNumber(args.value);
  const currency = args.currency || "EGP";

  trackStandard("AddPaymentInfo", {
    currency,
    value,
    payment_method: args.paymentMethod,
    num_items: numItems,
    contents,
  });
  gaEvent("add_payment_info", {
    currency,
    value,
    payment_type: args.paymentMethod,
    items: toGaItems(contents),
  });
}

export function trackPurchase(
  args: BaseCartPayload & { transactionId?: string }
): void {
  const contents = sanitizeContents(args.contents);
  const numItems = Math.max(0, args.numItems | 0);
  const value = clampNumber(args.value);
  const currency = args.currency || "EGP";

  trackStandard("Purchase", {
    currency,
    value,
    num_items: numItems,
    contents,
    content_type: "product",
    checkout_complete: true,
  });
  gaEvent("purchase", {
    transaction_id: args.transactionId,
    currency,
    value,
    items: toGaItems(contents),
  });
}

export function trackViewCart(args: BaseCartPayload): void {
  const contents = sanitizeContents(args.contents);
  const numItems = Math.max(0, args.numItems | 0);
  const value = clampNumber(args.value);
  const currency = args.currency || "EGP";

  trackStandard("ViewCart", {
    currency,
    value,
    num_items: numItems,
    contents,
    content_type: "product",
  });
  gaEvent("view_cart", { currency, value, items: toGaItems(contents) });
}

export function trackViewItem(args: ProductEventPayload): void {
  const price = clampNumber(args.price);
  const currency = args.currency || "EGP";
  const item: GaItem = {
    item_id: args.id,
    item_name: args.name,
    price,
    quantity: 1,
  };

  trackStandard("ViewContent", {
    content_ids: [args.id],
    content_name: args.name ?? "",
    content_type: "product",
    currency,
    value: price,
  });
  gaEvent("view_item", { currency, value: price, items: [item] });
}

export function trackAddToCart(args: ProductEventPayload): void {
  const price = clampNumber(args.price);
  const quantity = Math.max(1, (args.quantity ?? 1) | 0);
  const currency = args.currency || "EGP";
  const value = clampNumber(price * quantity);
  const item: GaItem = {
    item_id: args.id,
    item_name: args.name,
    price,
    quantity,
  };

  trackStandard("AddToCart", {
    content_ids: [args.id],
    content_name: args.name ?? "",
    content_type: "product",
    currency,
    value,
    contents: [{ id: args.id, quantity, price }],
  });
  gaEvent("add_to_cart", { currency, value, items: [item] });
}
