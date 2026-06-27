"use client";

import { useState } from "react";
import AccountOrders from "@/components/account/AccountOrders";
import AccountProfile from "@/components/account/AccountProfile";
import AccountWishlist from "@/components/account/AccountWishlist";

type TabType = "orders" | "profile" | "wishlist";

const isTabType = (value: string | null): value is TabType =>
  value === "orders" || value === "profile" || value === "wishlist";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window === "undefined") return "orders";
    const tab = new URLSearchParams(window.location.search).get("tab");
    return isTabType(tab) ? tab : "orders";
  });

  const tabs = [
    { id: "orders", label: "My Orders" },
    { id: "profile", label: "Profile" },
    { id: "wishlist", label: "Wishlist" },
  ];

  if (typeof window === undefined) return;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl text-heading mb-8">My Account</h1>

      {/* Tabs */}
      <div className="border-b border-hairline mb-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-4 relative transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                activeTab === tab.id
                  ? "font-medium text-heading"
                  : "text-ink-muted"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === "orders" && <AccountOrders />}
        {activeTab === "profile" && <AccountProfile />}
        {activeTab === "wishlist" && <AccountWishlist />}
      </div>
    </div>
  );
}
