"use client";

import { useCallback, useEffect, useState } from "react";
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
import { format, parseISO } from "date-fns";
import { formatPrice } from "@/utils/format";
import { productsService } from "@/services/products.service";
import { ProductAnalysis } from "@/types/admin-product.types";
import { adminTheme, statusToken, formatStatusLabel } from "@/constants/adminTheme";
import {
  Button,
  Card,
  StatCard,
  StatusBadge,
  SectionHeading,
  PageHeader,
  Skeleton,
} from "@/components/admin/ui";
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

function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="mb-8 h-9 w-44" />
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={i} className="flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </Card>
        ))}
      </div>
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Skeleton className="mb-6 h-5 w-32" />
          <Skeleton className="h-72 w-full" />
        </Card>
        <Card>
          <Skeleton className="mb-6 h-5 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await productsService.getAnalysis();
      setAnalysis(response.data.analysis);
    } catch (error) {
      setIsError(true);
      toast.error("Failed to fetch dashboard stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !analysis)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ExclamationTriangleIcon
          className="mb-3 h-10 w-10 text-admin-ink-subtle"
          aria-hidden="true"
        />
        <p className="mb-4 text-admin-ink-muted">Failed to load the dashboard.</p>
        <Button onClick={fetchAnalysis}>Try Again</Button>
      </div>
    );

  const { products, categories, orders, customers } = analysis;

  const statCards = [
    { name: "Total Products", value: products?.total ?? 0, icon: CubeIcon },
    { name: "Sold Out", value: products?.soldOut ?? 0, icon: ExclamationTriangleIcon },
    { name: "Total Categories", value: categories?.total ?? 0, icon: Squares2X2Icon },
    { name: "Total Customers", value: customers?.total ?? 0, icon: UserGroupIcon },
    { name: "Total Orders", value: orders?.total ?? 0, icon: ShoppingBagIcon },
    { name: "Total Revenue", value: formatPrice(orders?.totalRevenue ?? 0), icon: BanknotesIcon },
    { name: "Today’s Sales", value: formatPrice(orders?.todaySales ?? 0), icon: CurrencyDollarIcon },
    { name: "Today’s Orders", value: orders?.todayOrders ?? 0, icon: CalendarDaysIcon },
    { name: "Average Order Value", value: formatPrice(orders?.averageOrderValue ?? 0), icon: ScaleIcon },
  ];

  const last7Days = orders?.last7Days ?? [];
  const statusEntries = Object.entries(orders?.byStatus ?? {});
  const statusTotal = statusEntries.reduce((sum, [, count]) => sum + count, 0);
  const topSelling = products?.topSelling ?? [];

  const safeDate = (d: string) => {
    try {
      return format(parseISO(d), "MMM d");
    } catch {
      return d;
    }
  };

  return (
    <div>
      <PageHeader title="Dashboard" description="Your store at a glance." />

      {/* 1. Stat cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat, i) => (
          <div
            key={stat.name}
            className="admin-reveal"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <StatCard label={stat.name} value={stat.value} icon={stat.icon} />
          </div>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 2. Last 7 days */}
        <Card className="admin-reveal lg:col-span-2" style={{ animationDelay: "360ms" }}>
          <SectionHeading icon={CalendarDaysIcon}>Last 7 Days</SectionHeading>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={last7Days} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A0561B" />
                    <stop offset="100%" stopColor={adminTheme.accent.brown} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke={adminTheme.line.hairline} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={safeDate}
                  tick={{ fill: adminTheme.ink.muted, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: adminTheme.line.hairline }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: adminTheme.ink.muted, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  allowDecimals={false}
                  tick={{ fill: adminTheme.ink.muted, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: adminTheme.accent.goldSoft }}
                  contentStyle={{
                    borderRadius: 10,
                    border: `1px solid ${adminTheme.line.hairline}`,
                    boxShadow: adminTheme.shadow.popover,
                    color: adminTheme.ink.body,
                  }}
                  labelStyle={{ color: adminTheme.ink.heading, fontWeight: 600 }}
                  labelFormatter={(d) => safeDate(String(d))}
                  formatter={(value: number, name: string) =>
                    name === "Revenue" ? [formatPrice(value), name] : [value, name]
                  }
                />
                <Legend wrapperStyle={{ fontSize: 12, color: adminTheme.ink.muted }} />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue"
                  fill="url(#adminBar)"
                  radius={[4, 4, 0, 0]}
                  barSize={26}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke={adminTheme.line.gold}
                  strokeWidth={2}
                  dot={{ r: 3, fill: adminTheme.line.gold, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 3. Orders by status */}
        <Card className="admin-reveal" style={{ animationDelay: "440ms" }}>
          <SectionHeading icon={ClipboardDocumentListIcon}>Orders by Status</SectionHeading>
          {statusEntries.length === 0 ? (
            <p className="py-12 text-center text-sm text-admin-ink-muted">No order status data.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-admin-surface-sunken">
                {statusEntries.map(([status, count]) => (
                  <div
                    key={status}
                    style={{
                      width: `${statusTotal ? (count / statusTotal) * 100 : 0}%`,
                      backgroundColor: statusToken(status).dot,
                    }}
                    title={`${formatStatusLabel(status)}: ${count}`}
                  />
                ))}
              </div>
              <div className="space-y-2.5">
                {statusEntries.map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <StatusBadge status={status} />
                    <span className="tabular text-sm font-semibold text-admin-ink">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 4. Top selling */}
      <Card className="admin-reveal" style={{ animationDelay: "520ms" }}>
        <SectionHeading icon={TrophyIcon} accent="gold">
          Top Selling Products
        </SectionHeading>
        {topSelling.length === 0 ? (
          <p className="py-8 text-center text-sm text-admin-ink-muted">No sales recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {topSelling.map((product, index) => (
              <div
                key={`${product.productName}-${index}`}
                className="flex items-center gap-4 rounded-lg border border-admin-hairline p-3 transition-colors hover:bg-admin-surface-muted"
              >
                <span
                  className="tabular grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-sm font-semibold text-admin-brown"
                  style={{ backgroundColor: "var(--admin-brown-soft)" }}
                >
                  {index + 1}
                </span>
                <div
                  className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg"
                  style={{ backgroundColor: adminTheme.accent.goldBg }}
                >
                  {product.defaultImage?.mediaUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.defaultImage.mediaUrl}
                      alt={product.productName}
                      width={48}
                      height={48}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-admin-ink">{product.productName}</p>
                  <p className="tabular mt-0.5 text-sm text-admin-ink-muted">
                    {product.soldItems} sold
                  </p>
                </div>
                {!!product.discountPercentage && (
                  <span
                    className="tabular ml-3 flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: adminTheme.accent.goldBg,
                      color: statusToken("discount").text,
                    }}
                  >
                    -{product.discountPercentage}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
