"use client";

import { useEffect, useState } from "react";
import { offersService } from "@/services/offers.service";
import type { Product } from "@/types/product.types";

export interface ProductFlashSale {
  discountPercentage: number;
  endDate: string | null;
  title: string;
}

// An id may arrive as a raw string or a populated `{ _id }` document.
const idOf = (t: unknown): string =>
  typeof t === "object" && t !== null
    ? String((t as { _id?: unknown })._id ?? "")
    : String(t ?? "");

/**
 * Resolves the active flash-sale offer that applies to a given product, if any.
 *
 * Flash-sale pricing is not baked into the product document — the backend applies
 * it dynamically at order preview/checkout. This hook surfaces the same live
 * offer on the product page so the discount (and its countdown) can be shown,
 * matching what the customer is actually charged at purchase.
 */
export function useProductFlashSale(
  product?: Product | null
): ProductFlashSale | null {
  const [flash, setFlash] = useState<ProductFlashSale | null>(null);

  const productId = product?._id;
  const categoryId = product?.category?._id;

  useEffect(() => {
    if (!productId) {
      setFlash(null);
      return;
    }

    let active = true;
    (async () => {
      // getActiveOffers already returns only currently-live offers.
      const offers = await offersService.getActiveOffers(20);
      if (!active) return;

      const pid = String(productId);
      const cid = categoryId ? String(categoryId) : null;

      const match = offers.find(
        (o) =>
          o.offerType === "flash_sale" &&
          (o.reward?.discountPercentage ?? 0) > 0 &&
          ((o.targetProducts ?? []).some((t) => idOf(t) === pid) ||
            (cid !== null &&
              (o.targetCategories ?? []).some((t) => idOf(t) === cid)))
      );

      setFlash(
        match
          ? {
              discountPercentage: Math.round(match.reward!.discountPercentage!),
              endDate: match.timing?.endDate ?? null,
              title: match.title,
            }
          : null
      );
    })();

    return () => {
      active = false;
    };
  }, [productId, categoryId]);

  return flash;
}
