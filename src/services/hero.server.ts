import { HeroResponse } from "@/types/hero.types";

// Local fallbacks — used when the backend is unreachable or the slider is empty.
const FALLBACK_DESKTOP = "/hero/hero-desktop.jpg";
const FALLBACK_MOBILE = "/hero/hero-mobile.jpg";

export interface HeroImages {
  desktop: string;
  mobile: string;
}

const FALLBACK: HeroImages = {
  desktop: FALLBACK_DESKTOP,
  mobile: FALLBACK_MOBILE,
};

/**
 * Resolves the hero slider images on the SERVER so the correct CloudFront URL
 * is baked into the first paint — no client-side fetch, so no flash of the
 * local stock image swapping to the admin-set one. Falls back to the bundled
 * local images on any failure/empty slider (same graceful behaviour as before).
 *
 * `no-store`: the homepage renders the live admin-set hero on every request and
 * never fetches the backend at build time.
 */
export async function getHeroImagesServer(): Promise<HeroImages> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_URL) return FALLBACK;

  try {
    const res = await fetch(`${API_URL}/public/hero-section/get`, {
      cache: "no-store",
    });
    if (!res.ok) return FALLBACK;

    const json: HeroResponse = await res.json();
    if (!json?.success) return FALLBACK;

    const slide = (json.data.imageSlider || []).find(
      (s) => s?.images?.image2?.mediaUrl || s?.images?.image1?.mediaUrl
    );
    if (!slide) return FALLBACK;

    return {
      desktop:
        slide.images?.image2?.mediaUrl ||
        slide.images?.image1?.mediaUrl ||
        FALLBACK_DESKTOP,
      mobile:
        slide.images?.image1?.mediaUrl ||
        slide.images?.image2?.mediaUrl ||
        FALLBACK_MOBILE,
    };
  } catch {
    return FALLBACK;
  }
}
