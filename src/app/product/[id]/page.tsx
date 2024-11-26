import ProductDetails from "@/components/product/ProductDetails";
import RelatedProducts from "@/components/product/RelatedProducts";
import ProductReviews from "@/components/product/ProductReviews";

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductDetails productId={params.id} />
      <div className="mt-16 border-t border-gray-200 pt-16">
        <RelatedProducts />
      </div>
      <div className="mt-16 border-t border-gray-200 pt-16">
        <ProductReviews />
      </div>
    </div>
  );
}
