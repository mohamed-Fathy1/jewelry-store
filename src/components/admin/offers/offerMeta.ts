import { OfferType } from "@/types/offer.types";

export interface OfferTypeMeta {
  label: string;
  /** Short summary for the type dropdown option. */
  short: string;
  /** Full explanation shown in the contextual card once selected. */
  description: string;
}

/**
 * Canonical semantics for each offer type (mirrors the backend's
 * offers_test_examples.md). Used to guide the admin while configuring an offer.
 */
export const OFFER_TYPE_META: Record<OfferType, OfferTypeMeta> = {
  buy_x_get_cheapest_free: {
    label: "Buy X, Cheapest Free",
    short: "Buy N items — cheapest is free",
    description:
      "When the cart has at least the minimum quantity, the single cheapest item is given for free.",
  },
  spend_x_get_discount: {
    label: "Spend X, Get Discount",
    short: "Spend ≥ X — percentage off",
    description:
      "Once the cart subtotal reaches the minimum amount, a percentage discount is applied to the whole order.",
  },
  spend_x_get_free_shipping: {
    label: "Spend X, Free Shipping",
    short: "Spend ≥ X — free shipping",
    description:
      "Once the cart subtotal reaches the minimum amount, shipping is free.",
  },
  buy_x_get_free_shipping: {
    label: "Buy X, Free Shipping",
    short: "Buy N items — free shipping",
    description:
      "Buy at least the minimum quantity to unlock free shipping. Items in the excluded categories still ship but don't count toward qualifying.",
  },
  buy_x_get_half_price: {
    label: "Buy X, Half Price",
    short: "Buy N — cheapest other item 50% off",
    description:
      "With at least the minimum quantity in the cart, the cheapest other item is discounted by 50%.",
  },
  spend_x_get_free_item: {
    label: "Spend X, Free Item",
    short: "Spend ≥ X — free gift up to a value",
    description:
      "Once the cart subtotal reaches the minimum amount, the customer may choose a free item worth up to the max value.",
  },
  flash_sale: {
    label: "Flash Sale",
    short: "Timed discount on specific products",
    description:
      "The selected products get a percentage discount during the scheduled window. Flash sales stack on top of any cart offer.",
  },
};

export const OFFER_TYPE_LABELS = Object.fromEntries(
  Object.entries(OFFER_TYPE_META).map(([key, meta]) => [key, meta.label])
) as Record<OfferType, string>;

export const OFFER_TYPES = Object.keys(OFFER_TYPE_META) as OfferType[];
