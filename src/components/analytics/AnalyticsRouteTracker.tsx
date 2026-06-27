"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

/**
 * Sends a GA4 page_view on every client-side route change (the App Router does
 * not reload the page, so the gtag config — which has send_page_view:false —
 * relies on this). Mounted inside a Suspense boundary in the root layout
 * because useSearchParams opts the subtree into client rendering.
 */
export default function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const query = searchParams?.toString();
    trackPageView(query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams]);

  return null;
}
