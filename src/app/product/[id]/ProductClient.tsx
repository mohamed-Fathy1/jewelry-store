"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductDetails from "@/components/product/ProductDetails";
import RelatedProducts from "@/components/product/RelatedProducts";
import { productService } from "@/services/product.service";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useRouteId } from "@/lib/routeId";

export default function ProductClient() {
  const router = useRouter();
  const routeId = useRouteId("/product/");
  const productId = routeId.status === "resolved" ? routeId.id : null;
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    if (routeId.status === "pending") return;
    if (!productId) {
      // No usable id in the URL — same treatment as a product that's gone.
      router.replace("/");
      return;
    }

    // Drop the previous product before fetching the new one. A soft navigation
    // between two /product/<id> URLs reuses this component, and without the
    // reset the old product's category would render against the new id.
    setProductData(null);

    let active = true;
    (async () => {
      try {
        const response = await productService.getOneProduct(productId);
        if (!active) return;
        if (response?.success && response.data?.product) {
          setProductData(response.data.product);
        } else {
          // Product no longer exists / failed to load — send the user home.
          router.replace("/");
        }
      } catch (err) {
        // Same for network/404 errors — redirect instead of showing an error.
        if (active) router.replace("/");
      }
    })();

    return () => {
      active = false;
    };
  }, [routeId.status, productId, router]);

  if (!productId || !productData) return <LoadingSpinner />;
  if (!productData?.category) return <div>Product category not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-8 md:py-8">
      <ProductDetails productId={productId} />
      <div className="mt-12 border-t border-hairline pt-12">
        <RelatedProducts productId={productId} category={productData.category} />
      </div>
      <div className="mt-10 border-t border-hairline pt-10">
        {/* <ProductReviews /> */}
      </div>
    </div>
  );
}
