"use client";

import { useEffect, useState } from "react";
import { homeService } from "@/services/home.service";
import { HomeData } from "@/types/home.types";

const EMPTY: HomeData = {
  bestSellers: [],
  onSale: [],
  newArrivals: [],
  flashSale: [],
};

/**
 * Fetches the aggregated /home payload exactly once. Call this ONCE on the
 * homepage and pass the slices to sections as props — do not call it per
 * section, or /home fires multiple times.
 */
export function useHome() {
  const [data, setData] = useState<HomeData>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await homeService.getHome();
        if (active && res?.success) {
          // /home returns an array of flash sales; tolerate a legacy single object.
          const fs = (res.data as { flashSale?: unknown }).flashSale;
          setData({
            bestSellers: res.data.bestSellers ?? [],
            onSale: res.data.onSale ?? [],
            newArrivals: res.data.newArrivals ?? [],
            flashSale: Array.isArray(fs) ? fs : fs ? [fs as never] : [],
          });
        }
      } catch (err) {
        if (active) setError(err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { ...data, isLoading, error };
}
