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
import { formatPrice } from "@/utils/format";
import { ProductAnalysis } from "@/types/admin-product.types";
import { productsService } from "@/services/products.service";
import { Card, StatCard, Skeleton } from "@/components/admin/ui";

const GRID_CLASS =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8";

function AnalyticsSkeleton() {
  return (
    <div className={GRID_CLASS}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex items-center gap-4">
          <Skeleton className="h-11 w-11 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  );
}

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

  if (isLoading) return <AnalyticsSkeleton />;
  if (!analysis) return null;

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
      name: "Today’s Sales",
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
    <div className={GRID_CLASS}>
      {cards.map((card) => (
        <StatCard
          key={card.name}
          label={card.name}
          value={card.value}
          icon={card.icon}
        />
      ))}
    </div>
  );
}
