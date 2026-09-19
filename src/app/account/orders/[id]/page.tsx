import OrderTrackingClient from "./OrderTrackingClient";
import { SHELL_ID } from "@/lib/shellId";

// Orders are per-customer and cannot be enumerated at build time. A single
// shell page is exported under the sentinel id and CloudFront rewrites every
// real /account/orders/<id> onto it; the client reads the id from the URL.
export function generateStaticParams() {
  return [{ id: SHELL_ID }];
}

export default function OrderTrackingPage() {
  return <OrderTrackingClient />;
}
