"use client";

import { useState } from "react";
import { colors } from "@/constants/colors";
import AccountOrders from "@/components/account/AccountOrders";
import AccountProfile from "@/components/account/AccountProfile";
import AccountWishlist from "@/components/account/AccountWishlist";

type TabType = "orders" | "profile" | "wishlist";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<TabType>("orders");

  const tabs = [
    { id: "orders", label: "My Orders" },
    { id: "profile", label: "Profile" },
    { id: "wishlist", label: "Wishlist" },
  ];

  if (typeof window === undefined) return;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1
        className="text-3xl font-light mb-8"
        style={{ color: colors.textPrimary }}
      >
        My Account
      </h1>

      {/* Tabs */}
      <div className="border-b mb-8" style={{ borderColor: colors.border }}>
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-4 relative transition-colors duration-200 ${
                activeTab === tab.id ? "font-medium" : ""
              }`}
              style={{
                color:
                  activeTab === tab.id
                    ? colors.textPrimary
                    : colors.textSecondary,
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: colors.brown }}
                />
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
