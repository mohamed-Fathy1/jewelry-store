"use client";
import Hero from "@/components/home/Hero";
import BestSellers from "@/components/home/BestSellers";
import NewArrivals from "@/components/home/NewArrivals";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import HomePromoSection from "@/components/home/HomePromoSection";
import TarnishingPromo from "@/components/home/TarnishingPromo";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <BestSellers />
      <TarnishingPromo />
      <FeaturedCategories />
      <HomePromoSection />
      <NewArrivals />
    </div>
  );
}
