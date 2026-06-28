"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChartBarIcon,
  UsersIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  UserPlusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  TrophyIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import toast from "react-hot-toast";
import { Card, Skeleton, EmptyState } from "@/components/admin/ui";
import { adminTheme } from "@/constants/adminTheme";
import { adminAnalyticsService } from "@/services/admin-analytics.service";
import {
  CATEGORY_LABEL,
  PageCategory,
  resolvePageName,
  resolveSourceName,
} from "@/lib/pageNames";
import {
  OverviewReport,
  TopPagesReport,
  TrafficSourcesReport,
} from "@/types/analytics.types";

/* ── date-range presets (GA keywords) ──────────────────────────────────── */
const RANGES = [
  { key: "7d", label: "آخر 7 أيام", startDate: "7daysAgo", endDate: "today" },
  { key: "28d", label: "آخر 28 يوم", startDate: "28daysAgo", endDate: "today" },
  { key: "90d", label: "آخر 90 يوم", startDate: "90daysAgo", endDate: "today" },
] as const;
type RangeKey = (typeof RANGES)[number]["key"];

const numberFmt = new Intl.NumberFormat("ar-EG");
const fmt = (n: number) => numberFmt.format(Math.round(n || 0));
const shortDate = (d: string) => (d?.length === 10 ? d.slice(5).replace("-", "/") : d);

/** Average session duration (seconds) → "m:ss". */
function avgDuration(rows: OverviewReport["rows"]): string {
  if (!rows.length) return "—";
  const avg = rows.reduce((s, r) => s + (r.averageSessionDuration || 0), 0) / rows.length;
  const m = Math.floor(avg / 60);
  const s = Math.round(avg % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* category → chip tone */
const CATEGORY_TONE: Record<PageCategory, { bg: string; text: string }> = {
  store: { bg: "#F3E9CC", text: "#7A5B12" },
  admin: { bg: "#EFE7D8", text: "#6B5640" },
  account: { bg: "#E7ECF3", text: "#3A5A78" },
  auth: { bg: "#EAE4F0", text: "#564a78" },
  info: { bg: "#E4EFE2", text: "#3F6B3A" },
  other: { bg: "#EFE7D8", text: "#6B5640" },
};

/* donut palette for traffic sources */
const SOURCE_COLORS = [
  adminTheme.accent.gold,
  adminTheme.accent.brown,
  "#5B7FA0",
  "#5C8A52",
  "#A85B79",
  "#7A6CA8",
  "#A8917A",
];

/* ───────────────────────── skeleton ───────────────────────── */
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  );
}

/* ───────────────────────── header ───────────────────────── */
function Header({
  rangeKey,
  setRangeKey,
  onRefresh,
  isRefreshing,
  updatedAt,
}: {
  rangeKey: RangeKey;
  setRangeKey: (k: RangeKey) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  updatedAt: Date | null;
}) {
  const activeLabel = RANGES.find((r) => r.key === rangeKey)?.label ?? "";
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 shadow-admin-card ring-1 ring-admin-hairline/60"
      style={{
        background:
          "linear-gradient(135deg, #FFFFFF 0%, #FBF7EF 55%, #F3E9CC 100%)",
      }}
    >
      {/* faint decorative rings */}
      <div
        className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full opacity-50"
        style={{ background: "radial-gradient(circle, rgba(201,162,39,0.18), transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-start gap-4">
          <span
            className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl shadow-sm"
            style={{ background: "linear-gradient(140deg, #C9A227, #8B4513)" }}
          >
            <ChartBarIcon className="h-7 w-7 text-white" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-admin-heading sm:text-3xl">
              تحليلات الزوّار
            </h1>
            <p className="mt-1.5 max-w-md text-sm leading-6 text-admin-ink-muted">
              نظرة على حركة الزوّار على متجرك — {activeLabel}. البيانات من Google Analytics.
            </p>
            {updatedAt && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-admin-ink-subtle">
                <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                آخر تحديث:{" "}
                {updatedAt.toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-admin-hairline bg-admin-surface p-0.5 shadow-admin-card">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRangeKey(r.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  r.key === rangeKey
                    ? "bg-admin-brown text-admin-on-accent shadow-sm"
                    : "text-admin-ink-muted hover:bg-admin-surface-muted"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-admin-hairline bg-admin-surface text-admin-ink shadow-admin-card transition-colors hover:bg-admin-surface-muted disabled:opacity-60"
            aria-label="تحديث"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── KPI cards ───────────────────────── */
function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof UsersIcon;
  accent: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: accent }}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-admin-ink-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-admin-heading">
            {value}
          </p>
          {hint && <p className="mt-1 truncate text-xs text-admin-ink-subtle">{hint}</p>}
        </div>
        <span
          className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: "var(--admin-brown-soft)" }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}

/* ───────────────────────── chart tooltip ───────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      dir="rtl"
      className="rounded-xl border border-admin-hairline bg-admin-surface px-3.5 py-2.5 shadow-admin-popover"
    >
      <p className="mb-1.5 text-xs font-semibold text-admin-heading">{label}</p>
      <div className="space-y-1">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-admin-ink-muted">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
            </span>
            <span className="font-semibold tabular-nums text-admin-ink">{fmt(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── traffic chart ───────────────────────── */
function TrafficChart({ data }: { data: OverviewReport }) {
  if (!data.rows.length) {
    return (
      <Card>
        <EmptyState
          icon={ChartBarIcon}
          title="لا توجد بيانات في هذه الفترة"
          description="جرّب فترة زمنية أوسع، أو تأكد أن الموقع يجمّع بيانات Google Analytics."
        />
      </Card>
    );
  }
  return (
    <Card padded={false}>
      <div className="flex items-center justify-between border-b border-admin-hairline px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-admin-heading">حركة الزوّار عبر الوقت</h2>
          <p className="mt-0.5 text-xs text-admin-ink-muted">المستخدمون والجلسات والمشاهدات يوميًا</p>
        </div>
        <ChartBarIcon className="h-5 w-5 text-admin-ink-subtle" aria-hidden="true" />
      </div>
      <div className="h-80 w-full p-4" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data.rows} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gaUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={adminTheme.accent.gold} stopOpacity={0.35} />
                <stop offset="100%" stopColor={adminTheme.accent.gold} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke={adminTheme.line.hairline} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              tick={{ fill: adminTheme.ink.muted, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: adminTheme.line.hairline }}
            />
            <YAxis
              tick={{ fill: adminTheme.ink.muted, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: adminTheme.line.hairline }} />
            <Legend wrapperStyle={{ fontSize: 12, color: adminTheme.ink.muted }} />
            <Area
              type="monotone"
              name="مستخدمون نشطون"
              dataKey="activeUsers"
              stroke={adminTheme.accent.gold}
              strokeWidth={2.5}
              fill="url(#gaUsers)"
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              name="جلسات"
              dataKey="sessions"
              stroke={adminTheme.accent.brown}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              name="مشاهدات الصفحات"
              dataKey="screenPageViews"
              stroke={adminTheme.ink.subtle}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/* ───────────────────────── category chip ───────────────────────── */
function CategoryChip({ category }: { category: PageCategory }) {
  const tone = CATEGORY_TONE[category];
  return (
    <span
      className="inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: tone.bg, color: tone.text }}
    >
      {CATEGORY_LABEL[category]}
    </span>
  );
}

/* ───────────────────────── top pages ───────────────────────── */
function TopPages({ data }: { data: TopPagesReport }) {
  const max = Math.max(1, ...data.rows.map((r) => r.screenPageViews));
  return (
    <Card padded={false}>
      <div className="flex items-center justify-between border-b border-admin-hairline px-6 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-admin-heading">
            <DocumentTextIcon className="h-5 w-5 text-admin-brown" aria-hidden="true" />
            أكثر الصفحات زيارة
          </h2>
          <p className="mt-0.5 text-xs text-admin-ink-muted">الصفحات اللي بيدخلها زوّارك أكثر</p>
        </div>
      </div>

      {data.rows.length === 0 ? (
        <div className="p-6">
          <EmptyState icon={DocumentTextIcon} title="لا توجد بيانات" />
        </div>
      ) : (
        <ul className="divide-y divide-admin-hairline">
          {data.rows.map((r, i) => {
            const meta = resolvePageName(r.pagePath);
            const isTop = i === 0;
            return (
              <li key={r.pagePath} className="px-5 py-3.5 transition-colors hover:bg-admin-surface-muted">
                <div className="flex items-center gap-3">
                  {/* rank */}
                  <span
                    className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg text-xs font-bold tabular-nums"
                    style={
                      isTop
                        ? { background: "linear-gradient(140deg, #C9A227, #B4912033)", color: "#fff" }
                        : { backgroundColor: "var(--admin-surface-sunken)", color: "var(--admin-ink-muted)" }
                    }
                  >
                    {isTop ? <TrophyIcon className="h-4 w-4" aria-hidden="true" /> : fmt(i + 1)}
                  </span>

                  {/* name + path */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-admin-ink">
                        {meta.label}
                      </span>
                      <CategoryChip category={meta.category} />
                    </div>
                    <a
                      href={meta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate font-mono text-[11px] text-admin-ink-subtle transition-colors hover:text-admin-brown"
                      dir="ltr"
                    >
                      <ArrowTopRightOnSquareIcon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">{r.pagePath}</span>
                    </a>
                  </div>

                  {/* count */}
                  <div className="flex-shrink-0 text-left">
                    <p className="text-sm font-semibold tabular-nums text-admin-ink">
                      {fmt(r.screenPageViews)}
                    </p>
                    <p className="text-[10px] text-admin-ink-subtle">مشاهدة</p>
                  </div>
                </div>

                {/* bar */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-admin-surface-sunken">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(r.screenPageViews / max) * 100}%`,
                      background: isTop
                        ? "linear-gradient(90deg, #C9A227, #8B4513)"
                        : adminTheme.accent.gold,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/* ───────────────────────── traffic sources ───────────────────────── */
function TrafficSources({ data }: { data: TrafficSourcesReport }) {
  const rows = data.rows.filter((r) => r.sessions > 0);
  const total = Math.max(1, rows.reduce((s, r) => s + r.sessions, 0));
  const pieData = rows.slice(0, 6).map((r) => ({
    name: resolveSourceName(r.source),
    value: r.sessions,
  }));

  return (
    <Card padded={false}>
      <div className="flex items-center justify-between border-b border-admin-hairline px-6 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-admin-heading">
            <GlobeAltIcon className="h-5 w-5 text-admin-brown" aria-hidden="true" />
            مصادر الزيارات
          </h2>
          <p className="mt-0.5 text-xs text-admin-ink-muted">الزوّار جايين من فين</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyState icon={GlobeAltIcon} title="لا توجد بيانات" />
        </div>
      ) : (
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start">
          {/* donut */}
          <div className="relative mx-auto h-40 w-40 flex-shrink-0" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold tabular-nums text-admin-heading">
                {fmt(total)}
              </span>
              <span className="text-[10px] text-admin-ink-muted">جلسة</span>
            </div>
          </div>

          {/* legend / list */}
          <ul className="min-w-0 flex-1 space-y-2.5">
            {rows.slice(0, 6).map((r, i) => {
              const pct = Math.round((r.sessions / total) * 100);
              return (
                <li key={r.source}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-sm text-admin-ink">
                      <span
                        className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length] }}
                      />
                      <span className="truncate">{resolveSourceName(r.source)}</span>
                    </span>
                    <span className="flex flex-shrink-0 items-center gap-2">
                      <span className="text-xs text-admin-ink-muted tabular-nums">{pct}%</span>
                      <span className="text-sm font-semibold tabular-nums text-admin-ink">
                        {fmt(r.sessions)}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-admin-surface-sunken">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length] }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Owner-facing note about GA data timing/latency — fills the card and sets
          expectations so a low "today" number doesn't look like a bug. */}
      <div className="border-t border-admin-hairline bg-admin-surface-muted px-5 py-4">
        <div className="flex gap-2.5">
          <InformationCircleIcon
            className="h-5 w-5 flex-shrink-0 text-admin-gold"
            aria-hidden="true"
          />
          <div className="text-xs leading-6 text-admin-ink-muted">
            <p className="mb-0.5 font-semibold text-admin-ink">معلومة عن دقّة الأرقام</p>
            <p>
              الأرقام دي بتيجي من Google Analytics وبتتحدّث تلقائيًا. النشاط بيظهر عادةً خلال
              ساعات قليلة، لكن أرقام اليوم الحالي بتفضل مبدئية وبتكمل وتتظبط بشكل نهائي خلال 24
              إلى 48 ساعة. فلو لقيت رقم النهاردة أقل من المتوقّع، ده طبيعي — استنّى لبكرة وهتلاقيه
              اتعدّل.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ───────────────────────── page ───────────────────────── */
export default function AnalyticsPage() {
  const [rangeKey, setRangeKey] = useState<RangeKey>("7d");
  const [overview, setOverview] = useState<OverviewReport | null>(null);
  const [topPages, setTopPages] = useState<TopPagesReport | null>(null);
  const [sources, setSources] = useState<TrafficSourcesReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const range = useMemo(() => RANGES.find((r) => r.key === rangeKey)!, [rangeKey]);

  const fetchAll = useCallback(
    async (silent = false) => {
      if (silent) setIsRefreshing(true);
      else setIsLoading(true);
      setIsError(false);
      const params = { startDate: range.startDate, endDate: range.endDate };
      try {
        const [ov, tp, ts] = await Promise.all([
          adminAnalyticsService.getOverview(params),
          adminAnalyticsService.getTopPages(params),
          adminAnalyticsService.getTrafficSources(params),
        ]);
        setOverview(ov);
        setTopPages(tp);
        setSources(ts);
        setUpdatedAt(new Date());
      } catch (err: any) {
        setIsError(true);
        const msg = err?.response?.data?.message ?? "تعذّر تحميل بيانات التحليلات";
        if (silent) toast.error(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [range]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (isLoading) {
    return (
      <div dir="rtl">
        <AnalyticsSkeleton />
      </div>
    );
  }

  if (isError || !overview || !topPages || !sources) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center py-20 text-center">
        <ExclamationTriangleIcon className="mb-3 h-10 w-10 text-admin-ink-subtle" aria-hidden="true" />
        <p className="mb-4 max-w-md text-admin-ink-muted">
          تعذّر تحميل بيانات التحليلات. تأكد أن متغيّر <code>GA_PROPERTY_ID</code> مضبوط في الباك
          إند وأن حساب الخدمة مضاف كـ Viewer على خاصية GA4.
        </p>
        <button
          onClick={() => fetchAll()}
          className="inline-flex items-center gap-2 rounded-lg bg-admin-brown px-4 py-2 text-sm font-semibold text-admin-on-accent transition-colors hover:bg-admin-brown-hover"
        >
          <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const t = overview.totals;
  const days = Math.max(1, overview.rows.length);
  const topPageMeta = topPages.rows[0] ? resolvePageName(topPages.rows[0].pagePath) : null;

  return (
    <div dir="rtl" className="space-y-6">
      <Header
        rangeKey={rangeKey}
        setRangeKey={setRangeKey}
        onRefresh={() => fetchAll(true)}
        isRefreshing={isRefreshing}
        updatedAt={updatedAt}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="مستخدمون نشطون"
          value={fmt(t.activeUsers)}
          hint={`بمعدل ${fmt(t.activeUsers / days)} يوميًا`}
          icon={UsersIcon}
          accent={adminTheme.accent.gold}
        />
        <Kpi
          label="الجلسات"
          value={fmt(t.sessions)}
          hint={`متوسط مدة الجلسة ${avgDuration(overview.rows)}`}
          icon={CursorArrowRaysIcon}
          accent={adminTheme.accent.brown}
        />
        <Kpi
          label="مشاهدات الصفحات"
          value={fmt(t.screenPageViews)}
          hint={topPageMeta ? `الأعلى: ${topPageMeta.label}` : undefined}
          icon={EyeIcon}
          accent="#5B7FA0"
        />
        <Kpi
          label="مستخدمون جدد"
          value={fmt(t.newUsers)}
          hint={`${Math.round((t.newUsers / Math.max(1, t.activeUsers)) * 100)}% من الزوّار`}
          icon={UserPlusIcon}
          accent="#5C8A52"
        />
      </div>

      <TrafficChart data={overview} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopPages data={topPages} />
        <TrafficSources data={sources} />
      </div>
    </div>
  );
}
