import { getHeroImagesServer } from "@/services/hero.server";
import PromoBanner from "@/components/home/PromoBanner";
import HomeSections from "@/components/home/HomeSections";

export default async function HomePage() {
  // Resolve the hero image on the server so the correct (admin-set) CloudFront
  // URL is in the first paint — no client fetch, no flash of the local stock
  // image. The rest of the homepage (incl. the promo video) stays
  // client-rendered via <HomeSections />.
  const hero = await getHeroImagesServer();

  return (
    <div>
      <PromoBanner initialDesktop={hero.desktop} initialMobile={hero.mobile} />
      <HomeSections />
    </div>
  );
}
