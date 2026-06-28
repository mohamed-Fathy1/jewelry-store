import { getHeroImagesServer } from "@/services/hero.server";
import { getPromoVideoServer } from "@/services/video.server";
import PromoBanner from "@/components/home/PromoBanner";
import HomeSections from "@/components/home/HomeSections";

export default async function HomePage() {
  // Resolve the hero image and promo video on the server so the correct
  // (admin-set) CloudFront URLs are in the first paint — no client fetch, no
  // flash of the local stock assets. The rest of the homepage stays
  // client-rendered via <HomeSections />.
  const [hero, videoUrl] = await Promise.all([
    getHeroImagesServer(),
    getPromoVideoServer(),
  ]);

  return (
    <div>
      <PromoBanner initialDesktop={hero.desktop} initialMobile={hero.mobile} />
      <HomeSections videoUrl={videoUrl} />
    </div>
  );
}
