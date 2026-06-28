"use client";

import { useHome } from "@/hooks/useHome";
import CategoryStrip from "@/components/home/CategoryStrip";
import FlashSale from "@/components/home/FlashSale";
import BestSellers from "@/components/home/BestSellers";
import OnSale from "@/components/home/OnSale";
import WaysToSave from "@/components/home/WaysToSave";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import TarnishingPromo from "@/components/home/TarnishingPromo";
import NewArrivals from "@/components/home/NewArrivals";
import WhatsAppIcon from "@/components/home/WhatsAppIcon";

// Everything below the hero. Split out of page.tsx so the page can be a server
// component that resolves the hero image + promo video server-side (kills the
// first-paint flash); the single /home fetch lives here, with slices passed to
// sections. `videoUrl` is resolved server-side and threaded through to the promo.
interface HomeSectionsProps {
  videoUrl: string;
}

export default function HomeSections({ videoUrl }: HomeSectionsProps) {
  const { bestSellers, onSale, newArrivals, flashSale, isLoading } = useHome();

  return (
    <>
      <CategoryStrip />
      <FlashSale flashSales={flashSale} isLoading={isLoading} />
      <BestSellers products={bestSellers} isLoading={isLoading} />
      <OnSale products={onSale} isLoading={isLoading} />
      <WaysToSave />
      <FeaturedCategories />
      <TarnishingPromo videoUrl={videoUrl} />
      <NewArrivals products={newArrivals} isLoading={isLoading} />
      <WhatsAppIcon />
    </>
  );
}
