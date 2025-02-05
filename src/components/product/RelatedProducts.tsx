"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product.types";
import ProductCard from "./ProductCard";
import { colors } from "@/constants/colors";
import { productService } from "@/services/product.service";

interface RelatedProductsProps {
  productId: string;
  category: string;
}

export default function RelatedProducts({
  productId,
  category,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // Use productService to fetch products by category
        const response = await productService.getProductsByCategoryId(category);
        // Filter out the current product
        if (response.success) {
          const filteredProducts = response.data.products.data
            .filter((p) => p._id !== productId)
            .slice(0, 4);
          setProducts(filteredProducts);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    console.log("category", category);

    if (category) {
      fetchRelatedProducts();
    }
  }, [productId, category]);

  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <h2
        className="text-2xl font-medium mb-8"
        style={{ color: colors.textPrimary }}
      >
        Related Products
      </h2>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <ProductCard.Skeleton key={index} />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
