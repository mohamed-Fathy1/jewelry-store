"use client";

import ProductRailSection from "@/components/home/ProductRailSection";
import { Product } from "@/types/product.types";

interface BestSellersProps {
  products: Product[];
  isLoading?: boolean;
}

export default function BestSellers({ products, isLoading }: BestSellersProps) {
  return (
    <ProductRailSection
      title="Best Sellers"
      description="The pieces our community returns to, again and again."
      link={{ href: "/shop", label: "Shop all" }}
      products={products}
      isLoading={isLoading}
      badge="bestseller"
    />
  );
}
