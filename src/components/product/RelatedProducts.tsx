"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product.types";
import ProductCard from "./ProductCard";
import { productService } from "@/services/product.service";

interface RelatedProductsProps {
  productId: string;
  // Product.category can be a populated object or a bare id.
  category: string | { _id: string } | null | undefined;
}

export default function RelatedProducts({
  productId,
  category,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categoryId =
    typeof category === "string" ? category : category?._id ?? "";

  useEffect(() => {
    if (!categoryId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        const response = await productService.getProductsByCategoryId(
          categoryId
        );
        if (active && response.success) {
          setProducts(
            (response.data.products.data || [])
              .filter((p) => p._id !== productId)
              .slice(0, 4)
          );
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        if (active) setProducts([]);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [productId, categoryId]);

  if (!isLoading && products.length === 0) return null;

  return (
    <section>
      <h2 className="mb-10 font-display text-3xl text-heading">
        You may also like
      </h2>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <ProductCard.Skeleton key={i} />
            ))
          : products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
      </div>
    </section>
  );
}
