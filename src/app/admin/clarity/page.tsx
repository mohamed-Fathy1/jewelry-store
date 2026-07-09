"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CursorArrowRaysIcon,
  UsersIcon,
  EyeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  InformationCircleIcon,
  FireIcon,
  ArrowsUpDownIcon,
  ArrowUturnLeftIcon,
  BugAntIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Card, Skeleton, EmptyState } from "@/components/admin/ui";
import { adminTheme } from "@/constants/adminTheme";
import { adminAnalyticsService } from "@/services/admin-analytics.service";
import { ClarityInsights } from "@/types/analytics.types";

/* ── day-range presets (Clarity Live Insights supports 1–3 days) ─────────── */
const RANGES = [
  { key: 1, label: "آخر يوم" },
  { key: 2, label: "آخر يومين" },
  { key: 3, label: "آخر 3 أيام" },
] as const;

const numberFmt = new Intl.NumberFormat("ar-EG");
const fmt = (n: number) => numberFmt.format(Math.round(n || 0));
const pct = (n: number) => `${Math.round(n || 0)}%`;

/* Behavioral-metric display metadata. `desc` explains to the owner what each
   signal means (they're "frustration" signals — high numbers = UX problems). */
const BEHAVIOR_META: Record<
  string,
  { label: string; desc: string; icon: typeof FireIcon; accent: string }
> = {
  rageClicks: {
    label: "نقرات الغضب",
    desc: "العميل نقر بسرعة وعصبية على نفس المكان — غالبًا حاجة مش شغّالة أو بطيئة.",
    icon: FireIcon,
    accent: "#C0492F",
  },
  deadClicks: {
    label: "نقرات ميتة",
    desc: "نقرات على حاجة شكلها قابل للضغط لكنها مش بتعمل أي رد فعل.",
    icon: CursorArrowRaysIcon,
    accent: "#8B4513",
  },
  excessiveScrolling: {
    label: "تمرير مُفرط",
    desc: "العميل نزّل كتير وهو بيدوّر — غالبًا مش لاقي اللي عايزه بسهولة.",
    icon: ArrowsUpDownIcon,
    accent: "#5B7FA0",
  },
  quickBacks: {
    label: "رجوع سريع",
    desc: "دخل صفحة ورجع بسرعة — الصفحة مش اللي كان متوقّعها.",
    icon: ArrowUturnLeftIcon,
    accent: "#7A6CA8",
  },
  scriptErrors: {
    label: "أخطاء برمجية",
    desc: "أخطاء JavaScript حصلت أثناء التصفّح — ممكن تكسر وظائف في الموقع.",
    icon: BugAntIcon,
    accent: "#A85B79",
  },
  errorClicks: {
    label: "نقرات على أخطاء",
    desc: "نقرات أدّت لخطأ في الصفحة.",
    icon: ExclamationTriangleIcon,
    accent: "#B4912033",
  },
};

const BEHAVIOR_ORDER = [
  "rageClicks",
  "deadClicks",
  "excessiveScrolling",
  "quickBacks",
  "scriptErrors",
  "errorClicks",
];

/* ───────────────────────── skeleton ───────────────────────── */
function ClaritySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  );
}

/* ───────────────────────── header ───────────────────────── */
function Header({
  days,
  setDays,
  onRefresh,
  isRefreshing,
  updatedAt,
  stale,
}: {
  days: number;
  setDays: (d: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  updatedAt: Date | null;
  stale: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 shadow-admin-card ring-1 ring-admin-hairline/60"
      style={{
        background:
          "linear-gradient(135deg, #FFFFFF 0%, #FBF7EF 55%, #F3E9CC 100%)",
      }}
    >
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
            <CursorArrowRaysIcon className="h-7 w-7 text-white" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-admin-heading sm:text-3xl">
              سلوك المستخدم
            </h1>
            <p className="mt-1.5 max-w-md text-sm leading-6 text-admin-ink-muted">
              إشارات إحباط الزوّار على المتجر — البيانات من Microsoft Clarity.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {updatedAt && (
                <p className="inline-flex items-center gap-1.5 text-xs text-admin-ink-subtle">
                  <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  آخر تحديث:{" "}
                  {updatedAt.toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              {stale && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                  بيانات مخزّنة (تعذّر التحديث اللحظي)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-admin-hairline bg-admin-surface p-0.5 shadow-admin-card">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setDays(r.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  r.key === days
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

/* ───────────────────────── KPI card ───────────────────────── */
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
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} aria-hidden="true" />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-admin-ink-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-admin-heading">{value}</p>
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

/* ───────────────────────── behavior card ───────────────────────── */
function BehaviorCard({
  meta,
  count,
  sessions,
  percentage,
}: {
  meta: (typeof BEHAVIOR_META)[string];
  count: number;
  sessions: number;
  percentage: number;
}) {
  const Icon = meta.icon;
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span
          className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: "var(--admin-brown-soft)" }}
        >
          <Icon className="h-5 w-5" style={{ color: meta.accent }} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-admin-ink">{meta.label}</h3>
            <span className="text-lg font-semibold tabular-nums text-admin-heading">{fmt(count)}</span>
          </div>
          <p className="mt-1 text-[11px] leading-5 text-admin-ink-muted">{meta.desc}</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-admin-hairline pt-2 text-[11px] text-admin-ink-subtle">
        <span>{fmt(sessions)} جلسة متأثّرة</span>
        <span className="font-semibold text-admin-ink-muted tabular-nums">{pct(percentage)} من الجلسات</span>
      </div>
    </Card>
  );
}

/* ───────────────────────── page ───────────────────────── */
export default function ClarityPage() {
  const [days, setDays] = useState<number>(3);
  const [data, setData] = useState<ClarityInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const fetchData = useCallback(
    async (silent = false) => {
      if (silent) setIsRefreshing(true);
      else setIsLoading(true);
      setIsError(false);
      try {
        const res = await adminAnalyticsService.getClarityInsights(days);
        setData(res);
        setUpdatedAt(new Date());
      } catch (err: any) {
        setIsError(true);
        const msg = err?.response?.data?.message ?? "تعذّر تحميل بيانات Clarity";
        setErrorMsg(msg);
        if (silent) toast.error(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [days]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const behaviorsByKey = useMemo(() => {
    const map = new Map<string, ClarityInsights["behaviors"][number]>();
    (data?.behaviors ?? []).forEach((b) => map.set(b.key, b));
    return map;
  }, [data]);

  if (isLoading) {
    return (
      <div dir="rtl">
        <ClaritySkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center py-20 text-center">
        <ExclamationTriangleIcon className="mb-3 h-10 w-10 text-admin-ink-subtle" aria-hidden="true" />
        <p className="mb-4 max-w-md text-admin-ink-muted">
          {errorMsg || "تعذّر تحميل بيانات Clarity."} تأكد أن متغيّر{" "}
          <code>CLARITY_API_TOKEN</code> مضبوط في الباك إند.
        </p>
        <button
          onClick={() => fetchData()}
          className="inline-flex items-center gap-2 rounded-lg bg-admin-brown px-4 py-2 text-sm font-semibold text-admin-on-accent transition-colors hover:bg-admin-brown-hover"
        >
          <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const traffic = data.traffic;
  const totalSessions = traffic?.totalSessions ?? 0;
  const noData = totalSessions === 0;

  return (
    <div dir="rtl" className="space-y-6">
      <Header
        days={days}
        setDays={setDays}
        onRefresh={() => fetchData(true)}
        isRefreshing={isRefreshing}
        updatedAt={updatedAt}
        stale={data.stale}
      />

      {/* traffic KPIs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="الجلسات"
          value={fmt(totalSessions)}
          hint={traffic ? `منها ${fmt(traffic.botSessions)} بوت` : undefined}
          icon={CursorArrowRaysIcon}
          accent={adminTheme.accent.gold}
        />
        <Kpi
          label="مستخدمون مميّزون"
          value={fmt(traffic?.distinctUsers ?? 0)}
          icon={UsersIcon}
          accent={adminTheme.accent.brown}
        />
        <Kpi
          label="صفحات لكل جلسة"
          value={fmt(traffic?.pagesPerSession ?? 0)}
          icon={EyeIcon}
          accent="#5B7FA0"
        />
        <Kpi
          label="متوسط عمق التمرير"
          value={pct(data.averageScrollDepth ?? 0)}
          hint="كم بينزل الزائر في الصفحة"
          icon={ChartPieIcon}
          accent="#5C8A52"
        />
      </div>

      {/* "still collecting" note when there's no traffic yet */}
      {noData && (
        <Card>
          <div className="flex gap-3">
            <InformationCircleIcon className="h-6 w-6 flex-shrink-0 text-admin-gold" aria-hidden="true" />
            <div className="text-sm leading-6 text-admin-ink-muted">
              <p className="mb-0.5 font-semibold text-admin-ink">لسه مفيش بيانات كافية</p>
              <p>
                Clarity بيجمّع بيانات آخر 3 أيام بس، وبيبدأ يظهر أرقام بعد ما زوّار حقيقيين
                يتصفّحوا الموقع. لو التركيب اتعمل للتو، استنّى شوية وهتلاقي الأرقام بتظهر.
                البيانات بتتحدّث كل فترة (مخزّنة مؤقتًا لتوفير حصّة الـ API).
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* behavioral / frustration signals */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-admin-heading">
          <FireIcon className="h-5 w-5 text-admin-brown" aria-hidden="true" />
          إشارات الإحباط
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BEHAVIOR_ORDER.map((key) => {
            const meta = BEHAVIOR_META[key];
            const b = behaviorsByKey.get(key);
            return (
              <BehaviorCard
                key={key}
                meta={meta}
                count={b?.count ?? 0}
                sessions={b?.sessions ?? 0}
                percentage={b?.percentage ?? 0}
              />
            );
          })}
        </div>
      </div>

      {/* popular pages */}
      <Card padded={false}>
        <div className="flex items-center justify-between border-b border-admin-hairline px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-admin-heading">
              <DocumentTextIcon className="h-5 w-5 text-admin-brown" aria-hidden="true" />
              أكثر الصفحات زيارة
            </h2>
            <p className="mt-0.5 text-xs text-admin-ink-muted">حسب Clarity في الفترة المختارة</p>
          </div>
        </div>
        {data.popularPages.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={DocumentTextIcon} title="لا توجد بيانات صفحات بعد" />
          </div>
        ) : (
          <ul className="divide-y divide-admin-hairline">
            {data.popularPages.map((p, i) => (
              <li key={p.url + i} className="flex items-center gap-3 px-5 py-3 hover:bg-admin-surface-muted">
                <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-admin-surface-sunken text-xs font-bold tabular-nums text-admin-ink-muted">
                  {fmt(i + 1)}
                </span>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="inline-flex min-w-0 flex-1 items-center gap-1 truncate font-mono text-[11px] text-admin-ink-subtle transition-colors hover:text-admin-brown"
                >
                  <ArrowTopRightOnSquareIcon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{p.url}</span>
                </a>
                <span className="flex-shrink-0 text-sm font-semibold tabular-nums text-admin-ink">
                  {fmt(p.visits)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* footnote */}
      <div className="rounded-xl border border-admin-hairline bg-admin-surface-muted px-5 py-4">
        <div className="flex gap-2.5">
          <InformationCircleIcon className="h-5 w-5 flex-shrink-0 text-admin-gold" aria-hidden="true" />
          <div className="text-xs leading-6 text-admin-ink-muted">
            <p className="mb-0.5 font-semibold text-admin-ink">إزاي تقرأ الصفحة دي</p>
            <p>
              الأرقام دي بتقيس «إحباط» الزوّار: نقرات الغضب والنقرات الميتة معناها حاجة في
              الموقع مش شغّالة زي ما الزائر متوقّع. لو رقم معيّن عالي، افتح تسجيلات الجلسات
              في لوحة Clarity لتشوف بيحصل فين بالظبط. Clarity بيغطّي آخر 3 أيام، والبيانات
              مخزّنة مؤقتًا عندنا عشان حصّة الـ API محدودة (10 طلبات/يوم).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
