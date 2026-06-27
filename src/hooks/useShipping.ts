"use client";

import { useEffect, useState } from "react";
import { shippingService } from "@/services/shipping.service";
import { Shipping } from "@/types/shipping.types";

/** Public shipping costs for the announcement bar. Fails silently → static fallback. */
export function useShipping() {
  const [shipping, setShipping] = useState<Shipping[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await shippingService.getShipping();
        if (active && res?.success) setShipping(res.data.shipping ?? []);
      } catch {
        /* swallow — the bar renders its static message instead */
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const minCost = shipping.length
    ? Math.min(...shipping.map((s) => s.cost))
    : null;

  return { shipping, minCost, isLoading };
}
