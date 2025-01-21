"use client";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import BestSellers from "@/components/home/BestSellers";
import NewArrivals from "@/components/home/NewArrivals";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <BestSellers />
      <NewArrivals />
    </>
  );
}
