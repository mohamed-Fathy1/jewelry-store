"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Build-time id of the single exported shell page for a dynamic route.
 * CloudFront rewrites every real `/product/<id>` and `/account/orders/<id>`
 * onto that shell, so the route param is never a real id. Product and order
 * ids are 24-character hex ObjectIds, so a double-underscored word cannot
 * collide with one.
 */
export const SHELL_ID = "__shell__";

export type RouteId =
  | { status: "pending" }
  | { status: "resolved"; id: string }
  | { status: "missing" };

/**
 * Reads the real id out of the browser URL for a dynamic route mounted at
 * `prefix` (e.g. `"/product/"`).
 *
 * Only the URL carries the real id, because the shell's prerendered HTML is
 * served for every id. The read happens in an effect rather than during
 * render so the first client render still matches the prerendered markup and
 * hydration stays clean; `pending` is that one-render window.
 */
export function useRouteId(prefix: string): RouteId {
  // `usePathname` is the change signal (it updates on client-side navigation);
  // `window.location` is the source of truth, since the router's param for
  // this route is always the sentinel.
  const pathname = usePathname();
  const [routeId, setRouteId] = useState<RouteId>({ status: "pending" });

  useEffect(() => {
    const path = window.location.pathname;
    if (!path.startsWith(prefix)) {
      setRouteId({ status: "missing" });
      return;
    }
    const segment = path.slice(prefix.length).split("/")[0];
    const id = segment ? decodeURIComponent(segment) : "";
    setRouteId(
      id && id !== SHELL_ID
        ? { status: "resolved", id }
        : { status: "missing" }
    );
  }, [pathname, prefix]);

  return routeId;
}
