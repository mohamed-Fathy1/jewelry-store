"use client";

import { useHome } from "@/hooks/useHome";
import PromoBanner from "@/components/home/PromoBanner";
import CategoryStrip from "@/components/home/CategoryStrip";
import FlashSale from "@/components/home/FlashSale";
import BestSellers from "@/components/home/BestSellers";
import OnSale from "@/components/home/OnSale";
import WaysToSave from "@/components/home/WaysToSave";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import TarnishingPromo from "@/components/home/TarnishingPromo";
import NewArrivals from "@/components/home/NewArrivals";
import WhatsAppIcon from "@/components/home/WhatsAppIcon";

export default function HomePage() {
  // Single /home fetch; slices flow to sections as props.
  const { bestSellers, onSale, flashSale, isLoading } = useHome();

  return (
    <div>
      <PromoBanner />
      <CategoryStrip />
      <FlashSale flashSales={flashSale} isLoading={isLoading} />
      <BestSellers products={bestSellers} isLoading={isLoading} />
      <OnSale products={onSale} isLoading={isLoading} />
      <WaysToSave />
      <FeaturedCategories />
      <TarnishingPromo />
      <NewArrivals />
      <WhatsAppIcon />
    </div>
  );
}
