"use client";

import { useEffect, useState } from "react";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

interface StatCard {
  name: string;
  value: string | number;
  icon: any; // Consider using a more specific type
  change: string;
  changeType: "positive" | "negative";
}

export default function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        // TODO: Implement API call to fetch dashboard stats
        // const response = await adminService.getDashboardStats();
        // setDashboardStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statCards: StatCard[] = [
    {
      name: "Total Revenue",
      value: `$${dashboardStats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      change: "+12%",
      changeType: "positive",
    },
    {
      name: "Total Orders",
      value: dashboardStats.totalOrders,
      icon: ShoppingBagIcon,
      change: "+4%",
      changeType: "positive",
    },
    {
      name: "Total Customers",
      value: dashboardStats.totalCustomers,
      icon: UserGroupIcon,
      change: "+2.1%",
      changeType: "positive",
    },
    {
      name: "Total Products",
      value: dashboardStats.totalProducts,
      icon: CubeIcon,
      change: "-0.5%",
      changeType: "negative",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div
            key={item.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon
                    className="h-6 w-6 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {item.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          item.changeType === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add more dashboard components here */}
    </div>
  );
}
