"use client";

import WishlistList from "@/components/admin/wishlists/WishlistList";
import { PageHeader } from "@/components/admin/ui";

export default function WishlistsPage() {
  return (
    <div>
      <PageHeader
        title="Wishlists"
        description="Products customers have saved."
      />

      <WishlistList />
    </div>
  );
}
