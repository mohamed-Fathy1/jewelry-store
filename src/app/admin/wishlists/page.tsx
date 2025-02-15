"use client";

import { useState } from "react";
import WishlistList from "@/components/admin/wishlists/WishlistList";
import { colors } from "@/constants/colors";

export default function WishlistsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: colors.textPrimary }}
        >
          Wishlists
        </h1>
      </div>

      <WishlistList />
    </div>
  );
}
