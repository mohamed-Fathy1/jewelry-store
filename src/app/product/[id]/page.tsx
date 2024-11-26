import { Metadata } from "next";
import ProductDetails from "@/components/product/ProductDetails";
import RelatedProducts from "@/components/product/RelatedProducts";
import ProductReviews from "@/components/product/ProductReviews";

type PageProps = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return {
    title: `Product ${params.id} - Luxury Jewelry Store`,
    description: "Discover our exclusive collection of fine jewelry",
  };
}

export default function ProductPage({ params }: PageProps) {
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
