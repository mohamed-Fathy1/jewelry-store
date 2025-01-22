"use client";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import BestSellers from "@/components/home/BestSellers";
import NewArrivals from "@/components/home/NewArrivals";
import FeaturedCategories from "@/components/home/FeaturedCategories";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BestSellers />
      <FeaturedCategories />
      <NewArrivals />
    </>
  );
}
