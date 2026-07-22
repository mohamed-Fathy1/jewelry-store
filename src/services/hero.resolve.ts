import { HeroResponse } from "@/types/hero.types";

// Local fallbacks — used when the backend is unreachable or the slider is empty.
export const FALLBACK_DESKTOP = "/hero/hero-desktop.jpg";
export const FALLBACK_MOBILE = "/hero/hero-mobile.jpg";

export interface HeroImages {
  desktop: string;
  mobile: string;
}

export const HERO_FALLBACK: HeroImages = {
  desktop: FALLBACK_DESKTOP,
  mobile: FALLBACK_MOBILE,
};

/**
 * Maps a hero-section API response to the responsive image pair.
 *
 * image2 = large (desktop), image1 = small (mobile). Returns the local
 * fallbacks when the payload is missing, unsuccessful, or has no usable slide,
 * so callers get a valid image pair no matter what.
 *
 * Pure and client-safe — shared by the server resolver (first paint) and the
 * client fetch (browser recovery) so both agree on the mapping.
 */
export function resolveHeroImages(json: HeroResponse | null | undefined): HeroImages {
  if (!json?.success) return HERO_FALLBACK;

  const slide = (json.data?.imageSlider || []).find(
    (s) => s?.images?.image2?.mediaUrl || s?.images?.image1?.mediaUrl
  );
  if (!slide) return HERO_FALLBACK;

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
}
