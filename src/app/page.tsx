import Hero from "@/components/home/Hero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import NewArrivals from "@/components/home/NewArrivals";
import BestSellers from "@/components/home/BestSellers";

export default function Home() {
  return (
    <div className="space-y-16">
      <Hero />
      <BestSellers />
      <FeaturedCategories />
      <NewArrivals />
    </div>
  );
}
