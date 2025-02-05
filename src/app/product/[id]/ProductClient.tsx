"use client";

import { useEffect, useState } from "react";
import ProductDetails from "@/components/product/ProductDetails";
import RelatedProducts from "@/components/product/RelatedProducts";
import { productService } from "@/services/product.service";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ProductClient({ id }: { id: string }) {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productService.getOneProduct(id);
        if (response?.success) {
          setProductData(response.data.product);
        } else {
          setError("Failed to load product");
        }
      } catch (err) {
        setError("Error loading product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>{error}</div>;
  if (!productData?.category) return <div>Product category not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductDetails productId={id} />
      <div className="mt-12 border-t border-gray-200 pt-12">
        <RelatedProducts productId={id} category={productData.category} />
      </div>
      <div className="mt-10 border-t border-gray-200 pt-10">
        {/* <ProductReviews /> */}
      </div>
    </div>
  );
}
