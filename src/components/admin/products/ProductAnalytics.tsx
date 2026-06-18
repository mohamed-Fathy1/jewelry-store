"use client";

import { useEffect, useState } from "react";
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import { formatPrice } from "@/utils/format";
import { ProductAnalysis } from "@/types/admin-product.types";
import { productsService } from "@/services/products.service";

export default function ProductAnalytics() {
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await productsService.getAnalysis();
        setAnalysis(response.data.analysis);
      } catch (error) {
        // Silently ignore — the table is still usable without analytics.
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (isLoading || !analysis) return null;

  const cards = [
    {
      name: "Total Products",
      value: analysis.products?.total ?? 0,
      icon: CubeIcon,
    },
    {
      name: "Sold Out",
      value: analysis.products?.soldOut ?? 0,
      icon: ExclamationTriangleIcon,
    },
    {
      name: "Total Orders",
      value: analysis.orders?.total ?? 0,
      icon: ShoppingBagIcon,
    },
    {
      name: "Today's Sales",
      value: formatPrice(analysis.orders?.todaySales ?? 0),
      icon: CurrencyDollarIcon,
    },
    {
      name: "Total Revenue",
      value: formatPrice(analysis.orders?.totalRevenue ?? 0),
      icon: BanknotesIcon,
    },
    {
      name: "Total Customers",
      value: analysis.customers?.total ?? 0,
      icon: UserGroupIcon,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.name} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${colors.brown}20` }}
            >
              <card.icon className="h-5 w-5" style={{ color: colors.brown }} />
            </div>
            <div className="ml-3">
              <p
                className="text-xs font-medium"
                style={{ color: colors.textSecondary }}
              >
                {card.name}
              </p>
              <p
                className="text-lg font-semibold mt-0.5"
                style={{ color: colors.textPrimary }}
              >
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
