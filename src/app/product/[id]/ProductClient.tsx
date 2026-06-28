"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductDetails from "@/components/product/ProductDetails";
import RelatedProducts from "@/components/product/RelatedProducts";
import { productService } from "@/services/product.service";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ProductClient({ id }: { id: string }) {
  const router = useRouter();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productService.getOneProduct(id);
        if (response?.success && response.data?.product) {
          setProductData(response.data.product);
        } else {
          // Product no longer exists / failed to load — send the user home.
          router.replace("/");
        }
      } catch (err) {
        // Same for network/404 errors — redirect instead of showing an error.
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  if (loading || !productData) return <LoadingSpinner />;
  if (!productData?.category) return <div>Product category not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-8 md:py-8">
      <ProductDetails productId={id} />
      <div className="mt-12 border-t border-hairline pt-12">
        <RelatedProducts productId={id} category={productData.category} />
      </div>
      <div className="mt-10 border-t border-hairline pt-10">
        {/* <ProductReviews /> */}
      </div>
    </div>
  );
}
