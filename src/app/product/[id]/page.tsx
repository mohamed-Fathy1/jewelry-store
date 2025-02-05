import { Metadata } from "next";
import ProductClient from "./ProductClient";

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
  return <ProductClient id={id} />;
}
