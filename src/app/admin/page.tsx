"use client";

import { useEffect, useState } from "react";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import { adminService } from "@/services/admin.service";
import { DashboardStats } from "@/types/admin.types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getDashboardStats();
        setStats(response.data.analysis);
      } catch (error) {
        toast.error("Failed to fetch dashboard stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (!stats) return <div>Failed to load dashboard</div>;

  const statCards = [
    {
      name: "Total Revenue",
      value: stats.totalRevenue.toLocaleString("en-US", {
        style: "currency",
        currency: "EGP",
      }),
      icon: CurrencyDollarIcon,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      name: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBagIcon,
      change: "+4%",
      changeType: "positive" as const,
    },
    {
      name: "Total Customers",
      value: stats.totalCustomers,
      icon: UserGroupIcon,
      change: "+2.1%",
      changeType: "positive" as const,
    },
    {
      name: "Total Products",
      value: stats.totalProducts,
      icon: CubeIcon,
      change: "-0.5%",
      changeType: "negative" as const,
    },
  ];

  return (
    <div>
      <h1
        className="text-2xl font-semibold mb-8"
        style={{ color: colors.textPrimary }}
      >
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${colors.brown}20` }}
              >
                <stat.icon
                  className="h-6 w-6"
                  style={{ color: colors.brown }}
                />
              </div>
              <div className="ml-4">
                <p
                  className="text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  {stat.name}
                </p>
                <p
                  className="text-2xl font-semibold mt-1"
                  style={{ color: colors.textPrimary }}
                >
                  {stat.value}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
              <span
                className="text-sm ml-2"
                style={{ color: colors.textSecondary }}
              >
                from last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6">
          <h2
            className="text-lg font-semibold mb-6"
            style={{ color: colors.textPrimary }}
          >
            Revenue Overview
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={colors.brown}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* Recent Orders */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6">
          <h2
            className="text-lg font-semibold mb-6"
            style={{ color: colors.textPrimary }}
          >
            Recent Orders
          </h2>
          <div className="space-y-4">
            {stats.recentOrders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div>
                  <p
                    className="font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    Order #{order._id.slice(-8)}
                  </p>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    {order.price.toLocaleString("en-US", {
                      style: "currency",
                      currency: "EGP",
                    })}
                  </p>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
}
