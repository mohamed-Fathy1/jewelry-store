import ProductClient from "./ProductClient";
import { SHELL_ID } from "@/lib/shellId";

// The catalog is live, so product ids cannot be enumerated at build time.
// A single shell page is exported under the sentinel id and CloudFront rewrites
// every real /product/<id> onto it; ProductClient reads the id from the URL.
export function generateStaticParams() {
  return [{ id: SHELL_ID }];
}

export default function ProductPage() {
  return <ProductClient />;
}
