"use client";

import ProductRailSection from "@/components/home/ProductRailSection";
import { Product } from "@/types/product.types";

interface OnSaleProps {
  products: Product[];
  isLoading?: boolean;
}

export default function OnSale({ products, isLoading }: OnSaleProps) {
  return (
    <ProductRailSection
      title="On Sale"
      description="A considered selection, gently reduced."
      link={{ href: "/shop?sale=true", label: "View all" }}
      products={products}
      isLoading={isLoading}
      badge="sale"
      surface="muted"
    />
  );
}
