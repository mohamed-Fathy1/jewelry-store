import { HeroResponse } from "@/types/hero.types";
import { HERO_FALLBACK, HeroImages, resolveHeroImages } from "./hero.resolve";

export type { HeroImages } from "./hero.resolve";

/**
 * Resolves the hero slider images on the SERVER so the correct CloudFront URL
 * is baked into the first paint — no client-side fetch, so no flash of the
 * local stock image swapping to the admin-set one. Falls back to the bundled
 * local images on any failure/empty slider.
 *
 * The client components re-fetch on mount (see hero.service) so that even if
 * this server fetch fails (e.g. the API host isn't reachable from the render
 * environment) the browser still recovers the admin-set images.
 *
 * `no-store`: the homepage renders the live admin-set hero on every request and
 * never fetches the backend at build time.
 */
export async function getHeroImagesServer(): Promise<HeroImages> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_URL) return HERO_FALLBACK;

  try {
    const res = await fetch(`${API_URL}/public/hero-section/get`, {
      cache: "no-store",
    });
    if (!res.ok) return HERO_FALLBACK;

    const json: HeroResponse = await res.json();
    return resolveHeroImages(json);
  } catch {
    return HERO_FALLBACK;
  }
}
