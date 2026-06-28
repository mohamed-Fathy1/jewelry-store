import { Metadata } from "next";
import ProductClient from "./ProductClient";
import type { Product, VariantSize } from "@/types/product.types";
import { SITE_URL as DEFAULT_SITE_URL } from "@/lib/pageNames";

type tParams = Promise<{ id: string }>;

// Public site origin used for canonical/og:url. Env var wins (e.g. staging);
// otherwise use the live domain so social-media crawlers always get an absolute
// URL even when the var isn't set at build time.
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
).replace(/\/$/, "");

// Server-side fetch of a single product for metadata. Kept separate from the
// client `productService` (which relies on a browser axios instance) so the
// social-media crawler gets fully-rendered Open Graph tags on first request.
async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
      // Cache briefly so repeated crawler hits don't hammer the API but edits
      // still propagate within a few minutes.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.product ?? null;
  } catch {
    return null;
  }
}

// Unique, ordered size labels across all variants (e.g. "16, 18, 20").
function sizesSummary(product: Product): string {
  const seen = new Map<string, VariantSize>();
  (product.variants ?? []).forEach((v) => {
    if (v.size && typeof v.size === "object") {
      const s = v.size as VariantSize;
      if (!seen.has(s._id)) seen.set(s._id, s);
    }
  });
  return Array.from(seen.values())
    .sort((a, b) => a.order - b.order)
    .map((s) => s.number)
    .join(", ");
}

export async function generateMetadata(props: {
  params: tParams;
}): Promise<Metadata> {
  const { id } = await props.params;
  const product = await fetchProduct(id);

  // Product missing/unreachable — fall back to generic store metadata.
  if (!product) {
    return {
      title: "Luxury Jewelry Store",
      description: "Discover our exclusive collection of fine jewelry",
    };
  }

  const title = `${product.productName} - A to Z Accessories`;
  const price = product.salePrice || product.price;
  const sizes = sizesSummary(product);

  // Build a share-friendly description: product copy + price + available sizes.
  const parts: string[] = [];
  if (product.productDescription) parts.push(product.productDescription.trim());
  parts.push(`السعر: ${price.toLocaleString()} EGP`);
  if (sizes) parts.push(`المقاسات المتاحة: ${sizes}`);
  const description = parts.join(" · ").slice(0, 300);

  const image = product.defaultImage?.mediaUrl;
  const url = `${SITE_URL}/product/${id}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "A to Z Accessories",
      ...(image
        ? {
            images: [
              {
                url: image,
                width: 1200,
                height: 1200,
                alt: product.productName,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductPage(props: { params: tParams }) {
  const { id } = await props.params;
  return <ProductClient id={id} />;
}
