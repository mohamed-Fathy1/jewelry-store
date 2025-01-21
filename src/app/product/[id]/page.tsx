import { Metadata } from "next";
import ProductDetails from "@/components/product/ProductDetails";
import RelatedProducts from "@/components/product/RelatedProducts";
// import ProductReviews from "@/components/product/ProductReviews";

type tParams = Promise<{ id: string }>;

export async function generateMetadata(props: {
  params: tParams;
}): Promise<Metadata> {
  const { id } = await props.params;
  return {
    title: `Product ${id} - Luxury Jewelry Store`,
    description: "Discover our exclusive collection of fine jewelry",
  };
}

export default async function ProductPage(props: { params: tParams }) {
  const { id } = await props.params;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductDetails productId={id} />
      <div className="mt-16 border-t border-gray-200 pt-16">
        <RelatedProducts productId={id} />
      </div>
      <div className="mt-16 border-t border-gray-200 pt-16">
        {/* <ProductReviews /> */}
      </div>
    </div>
  );
}
