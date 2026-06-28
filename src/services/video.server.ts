import { VideoResponse } from "@/types/video.types";

// Bundled fallback used when the backend is unreachable or no video has been
// uploaded by the admin yet. Mirrors the original hard-coded promo video.
const FALLBACK_VIDEO = "https://d1xdt7gkixoxw1.cloudfront.net/IMG_1602.mp4";

/**
 * Resolves the homepage promo video on the SERVER so the admin-set CloudFront
 * URL is baked into the first paint (same no-flash approach as the hero). Falls
 * back to the bundled video on any failure or when the singleton is empty.
 *
 * `no-store`: the homepage always renders the live admin-set video.
 */
export async function getPromoVideoServer(): Promise<string> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_URL) return FALLBACK_VIDEO;

  try {
    const res = await fetch(`${API_URL}/public/video/get`, {
      cache: "no-store",
    });
    if (!res.ok) return FALLBACK_VIDEO;

    const json: VideoResponse = await res.json();
    if (!json?.success) return FALLBACK_VIDEO;

    return json.data.video?.mediaUrl || FALLBACK_VIDEO;
  } catch {
    return FALLBACK_VIDEO;
  }
}
