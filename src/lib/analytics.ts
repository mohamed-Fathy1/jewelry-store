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
  }
}

type FbqParams = Record<string, AnalyticsValue>;

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
}

export function trackPurchase(args: BaseCartPayload): void {
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
}
