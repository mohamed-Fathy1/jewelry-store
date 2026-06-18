"use client";

import { useEffect, useState } from "react";
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  UserGroupIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ScaleIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import { formatPrice } from "@/utils/format";
import { productsService } from "@/services/products.service";
import { ProductAnalysis } from "@/types/admin-product.types";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import toast from "react-hot-toast";

// Color-coded badge styles for the dynamic order-status keys. Anything not
// listed falls back to a neutral beige tone from the design palette.
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  delivered: { bg: "#DCFCE7", text: "#166534" },
  shipped: { bg: "#DBEAFE", text: "#1E40AF" },
  processing: { bg: "#E0E7FF", text: "#3730A3" },
  pending: { bg: "#FEF3C7", text: "#92400E" },
  under_review: { bg: "#FEF9C3", text: "#854D0E" },
  cancelled: { bg: "#FEE2E2", text: "#991B1B" },
  refunded: { bg: "#FCE7F3", text: "#9D174D" },
};

const statusStyle = (status: string) =>
  STATUS_STYLES[status] ?? {
    bg: colors.accentLight,
    text: colors.accentDark,
  };

const formatStatusLabel = (status: string) =>
  status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function AdminDashboard() {
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await productsService.getAnalysis();
        setAnalysis(response.data.analysis);
      } catch (error) {
        toast.error("Failed to fetch dashboard stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (isLoading)
    return (
      <p style={{ color: colors.textSecondary }}>Loading dashboard…</p>
    );
  if (!analysis)
    return (
      <p style={{ color: colors.textSecondary }}>Failed to load dashboard.</p>
    );

  const { products, categories, orders, customers } = analysis;

  const statCards = [
    { name: "Total Products", value: products?.total ?? 0, icon: CubeIcon },
    {
      name: "Sold Out",
      value: products?.soldOut ?? 0,
      icon: ExclamationTriangleIcon,
    },
    {
      name: "Total Categories",
      value: categories?.total ?? 0,
      icon: Squares2X2Icon,
    },
    {
      name: "Total Customers",
      value: customers?.total ?? 0,
      icon: UserGroupIcon,
    },
    {
      name: "Total Orders",
      value: orders?.total ?? 0,
      icon: ShoppingBagIcon,
    },
    {
      name: "Total Revenue",
      value: formatPrice(orders?.totalRevenue ?? 0),
      icon: BanknotesIcon,
    },
    {
      name: "Today's Sales",
      value: formatPrice(orders?.todaySales ?? 0),
      icon: CurrencyDollarIcon,
    },
    {
      name: "Today's Orders",
      value: orders?.todayOrders ?? 0,
      icon: CalendarDaysIcon,
    },
    {
      name: "Average Order Value",
      value: formatPrice(orders?.averageOrderValue ?? 0),
      icon: ScaleIcon,
    },
  ];

  const last7Days = orders?.last7Days ?? [];
  const statusEntries = Object.entries(orders?.byStatus ?? {});
  const statusTotal = statusEntries.reduce((sum, [, count]) => sum + count, 0);
  const topSelling = products?.topSelling ?? [];

  return (
    <div>
      <h1
        className="text-2xl font-semibold mb-8"
        style={{ color: colors.textPrimary }}
      >
        Dashboard
      </h1>

      {/* 1. Stats cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
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
              <div className="ml-4 min-w-0">
                <p
                  className="text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  {stat.name}
                </p>
                <p
                  className="text-2xl font-semibold mt-1 truncate"
                  style={{ color: colors.textPrimary }}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 2. Last 7 Days chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
          <h2
            className="text-lg font-semibold mb-6"
            style={{ color: colors.textPrimary }}
          >
            Last 7 Days
          </h2>
          {last7Days.length === 0 ? (
            <p
              className="text-sm py-12 text-center"
              style={{ color: colors.textSecondary }}
            >
              No sales data for the last 7 days.
            </p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={last7Days}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={colors.border}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: colors.textSecondary, fontSize: 12 }}
                    stroke={colors.border}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: colors.textSecondary, fontSize: 12 }}
                    stroke={colors.border}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    allowDecimals={false}
                    tick={{ fill: colors.textSecondary, fontSize: 12 }}
                    stroke={colors.border}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    }}
                    formatter={(value: number, name: string) =>
                      name === "Revenue"
                        ? [formatPrice(value), name]
                        : [value, name]
                    }
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="Revenue"
                    fill={colors.brown}
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke={colors.gold}
                    strokeWidth={2}
                    dot={{ r: 3, fill: colors.gold }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 3. Orders by status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <ClipboardDocumentListIcon
              className="h-5 w-5 mr-2"
              style={{ color: colors.brown }}
            />
            <h2
              className="text-lg font-semibold"
              style={{ color: colors.textPrimary }}
            >
              Orders by Status
            </h2>
          </div>
          {statusEntries.length === 0 ? (
            <p
              className="text-sm py-12 text-center"
              style={{ color: colors.textSecondary }}
            >
              No order status data.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Breakdown bar */}
              <div className="flex h-3 w-full overflow-hidden rounded-full">
                {statusEntries.map(([status, count]) => {
                  const style = statusStyle(status);
                  const width = statusTotal
                    ? (count / statusTotal) * 100
                    : 0;
                  return (
                    <div
                      key={status}
                      style={{
                        width: `${width}%`,
                        backgroundColor: style.text,
                      }}
                      title={`${formatStatusLabel(status)}: ${count}`}
                    />
                  );
                })}
              </div>

              {/* Color-coded badges */}
              <div className="space-y-2">
                {statusEntries.map(([status, count]) => {
                  const style = statusStyle(status);
                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: style.bg,
                          color: style.text,
                        }}
                      >
                        {formatStatusLabel(status)}
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: colors.textPrimary }}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Top Selling Products */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <TrophyIcon
            className="h-5 w-5 mr-2"
            style={{ color: colors.gold }}
          />
          <h2
            className="text-lg font-semibold"
            style={{ color: colors.textPrimary }}
          >
            Top Selling Products
          </h2>
        </div>
        {topSelling.length === 0 ? (
          <p
            className="text-sm py-8 text-center"
            style={{ color: colors.textSecondary }}
          >
            No sales recorded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {topSelling.map((product, index) => (
              <div
                key={`${product.productName}-${index}`}
                className="flex items-center p-3 rounded-lg border"
                style={{ borderColor: colors.border }}
              >
                <span
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mr-3"
                  style={{
                    backgroundColor: `${colors.brown}20`,
                    color: colors.brown,
                  }}
                >
                  {index + 1}
                </span>
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden mr-4"
                  style={{ backgroundColor: colors.accentLight }}
                >
                  {product.defaultImage?.mediaUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.defaultImage.mediaUrl}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium truncate"
                    style={{ color: colors.textPrimary }}
                  >
                    {product.productName}
                  </p>
                  <p
                    className="text-sm mt-0.5"
                    style={{ color: colors.textSecondary }}
                  >
                    {product.soldItems} sold
                  </p>
                </div>
                {!!product.discountPercentage && (
                  <span
                    className="ml-3 flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: `${colors.gold}26`,
                      color: colors.accentDark,
                    }}
                  >
                    -{product.discountPercentage}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
