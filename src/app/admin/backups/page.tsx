"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClockIcon,
  CircleStackIcon,
  ArchiveBoxIcon,
  ServerStackIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Card, Skeleton, EmptyState } from "@/components/admin/ui";
import { backupService } from "@/services/backup.service";
import { BackupData } from "@/types/backup.types";
import { formatArabicDateTime, formatArabicRelative } from "@/utils/arabicDate";

/* ------------------------------------------------------------------ *
 * Editable page copy. Change the text / support number here.
 * (Move to a DB-backed settings doc later if the admin needs to edit it.)
 * ------------------------------------------------------------------ */
const PAGE = {
  title: "النسخ الاحتياطية",
  intro:
    "هذه نسخة احتياطية من بيانات الموقع تُؤخَذ يوميًا للحماية في حال حدوث أي مشكلة. لو لاحظت أن نسخة أحد الأيام غير موجودة أو ظهر تنبيه أحمر، بلّغ فريق المطوّرين فورًا.",
  supportTitle: "عندك مشكلة في النسخ الاحتياطية؟",
  supportSubtitle: "تواصل مع فريق التطوير على واتساب:",
  supportPhoneDisplay: "01025502697",
  supportPhoneIntl: "201025502697", // wa.me format: country code + number (no leading 0)
};

const HEALTHY = { bg: "#E4EFE2", text: "#3F6B3A", dot: "#5C8A52" };
const DANGER = { bg: "#F4E0DC", text: "#8A3324", dot: "#B4503C" };

/** WhatsApp glyph (heroicons has no brand icons). `currentColor`-driven. */
function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.555-5.338 11.89-11.893 11.89a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.04 1.99-.667zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

function PageTitle() {
  return (
    <div>
      <h1 className="flex items-center gap-2.5 text-3xl font-semibold text-admin-heading">
        <ShieldCheckIcon className="h-8 w-8 text-admin-gold" aria-hidden="true" />
        {PAGE.title}
      </h1>
      <div
        className="mt-3 h-px w-16 rounded-full"
        style={{ backgroundColor: "var(--admin-gold)" }}
        aria-hidden="true"
      />
    </div>
  );
}

/* --- Loading skeleton ------------------------------------------------ */
function BackupsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-40 w-full rounded-xl lg:col-span-2" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}

/* --- Status hero ----------------------------------------------------- */
function StatusHero({ data }: { data: BackupData }) {
  const { summary } = data;
  const healthy = summary.healthy;
  const tone = healthy ? HEALTHY : DANGER;
  const Icon = healthy ? CheckCircleIcon : ExclamationTriangleIcon;

  const stats = [
    {
      label: "عدد النسخ المحفوظة",
      value: summary.total,
      icon: ArchiveBoxIcon,
    },
    {
      label: "حجم آخر نسخة",
      value: summary.latestSize ?? "—",
      icon: CircleStackIcon,
    },
    {
      label: "آخر نسخة احتياطية",
      value: summary.latestAt ? formatArabicRelative(summary.latestAt) : "—",
      icon: ClockIcon,
    },
  ];

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <span
          className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-full"
          style={{ backgroundColor: tone.bg }}
        >
          <Icon className="h-8 w-8" style={{ color: tone.text }} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: tone.dot }}
              aria-hidden="true"
            />
            <p className="text-xl font-semibold" style={{ color: tone.text }}>
              {healthy ? "النسخ الاحتياطية سليمة" : "تنبيه: النسخ الاحتياطية متأخرة"}
            </p>
          </div>
          {summary.latestAt && (
            <p className="mt-1.5 text-sm text-admin-ink-muted">
              آخر نسخة احتياطية:{" "}
              <span className="font-medium text-admin-ink">
                {formatArabicRelative(summary.latestAt)}
              </span>{" "}
              · {summary.latestSize} · {summary.total} نسخة محفوظة
            </p>
          )}
        </div>
      </div>

      {/* mini stats */}
      <div className="grid grid-cols-1 divide-y divide-admin-hairline border-t border-admin-hairline sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:[&>*]:border-0">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3 px-6 py-4">
            <span
              className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg"
              style={{ backgroundColor: "var(--admin-brown-soft)" }}
            >
              <s.icon className="h-5 w-5 text-admin-brown" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-admin-ink-muted">{s.label}</p>
              <p className="truncate text-sm font-semibold text-admin-ink">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* bucket / region footer */}
      <div className="flex flex-wrap items-center gap-2 border-t border-admin-hairline bg-admin-surface-muted px-6 py-3 text-xs text-admin-ink-muted">
        <ServerStackIcon className="h-4 w-4 text-admin-ink-subtle" aria-hidden="true" />
        <span className="font-mono" dir="ltr">
          {summary.bucket}
        </span>
        <span className="text-admin-ink-subtle">·</span>
        <span className="font-mono" dir="ltr">
          {summary.region}
        </span>
      </div>
    </Card>
  );
}

/* --- Guidance + support side cards ----------------------------------- */
function GuideCard() {
  return (
    <Card className="lg:col-span-2">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-admin-heading">
        <ShieldCheckIcon className="h-5 w-5 text-admin-brown" aria-hidden="true" />
        ما هذه الصفحة؟
      </h2>
      <p className="text-sm leading-7 text-admin-ink-muted">{PAGE.intro}</p>
    </Card>
  );
}

function SupportCard() {
  return (
    <div
      className="flex flex-col rounded-xl border-r-4 p-6 shadow-admin-card"
      style={{
        backgroundColor: "rgba(37, 211, 102, 0.08)",
        borderColor: "#25D366",
        boxShadow:
          "inset 0 0 0 1px rgba(37,211,102,0.22), 0 1px 2px rgba(80,50,20,0.04), 0 6px 16px -4px rgba(80,50,20,0.08)",
      }}
    >
      <h2
        className="mb-2 flex items-center gap-2 text-base font-bold"
        style={{ color: "#0F8A4D" }}
      >
        <WhatsAppIcon className="h-5 w-5" />
        تحديث
      </h2>
      <p className="text-sm font-medium text-admin-ink">{PAGE.supportTitle}</p>
      <p className="mb-4 text-sm text-admin-ink-muted">{PAGE.supportSubtitle}</p>
      <a
        href={`https://wa.me/${PAGE.supportPhoneIntl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
        style={{ backgroundColor: "#25D366" }}
        dir="ltr"
      >
        <WhatsAppIcon className="h-6 w-6" />
        {PAGE.supportPhoneDisplay}
      </a>
    </div>
  );
}

/* --- Log table ------------------------------------------------------- */
function BackupLog({ data }: { data: BackupData }) {
  return (
    <Card padded={false}>
      <div className="border-b border-admin-hairline px-6 py-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-admin-heading">
          <CalendarDaysIcon className="h-5 w-5 text-admin-brown" aria-hidden="true" />
          السجل
        </h2>
        <p className="mt-1 text-xs text-admin-ink-muted">
          الأحدث أولاً. الأوقات معروضة بتوقيتك المحلي.
        </p>
      </div>

      {data.backups.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={ArchiveBoxIcon}
            title="لا توجد نسخ احتياطية بعد"
            description="لم يتم العثور على أي نسخة في مخزن النسخ الاحتياطية."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-admin-hairline text-xs font-medium uppercase tracking-wide text-admin-ink-muted">
                <th className="px-6 py-3 font-medium">التاريخ</th>
                <th className="px-6 py-3 font-medium">الحجم</th>
                <th className="px-6 py-3 font-medium">الملف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-hairline">
              {data.backups.map((b) => (
                <tr key={b.key} className="transition-colors hover:bg-admin-surface-muted">
                  <td className="px-6 py-4 align-top">
                    <p className="font-medium text-admin-ink">
                      {formatArabicDateTime(b.createdAt)}
                    </p>
                    <p className="mt-0.5 text-xs text-admin-ink-muted">
                      {formatArabicRelative(b.createdAt)}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 align-top tabular-nums text-admin-ink">
                    {b.size}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span
                      className="inline-flex items-center gap-1.5 font-mono text-xs text-admin-ink-muted"
                      dir="ltr"
                    >
                      <DocumentArrowDownIcon
                        className="h-4 w-4 flex-shrink-0 text-admin-ink-subtle"
                        aria-hidden="true"
                      />
                      {b.fileName}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

/* --- Page ------------------------------------------------------------ */
export default function BackupsPage() {
  const [data, setData] = useState<BackupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBackups = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setIsLoading(true);
    setIsError(false);
    try {
      const res = await backupService.getBackups();
      setData(res.data);
    } catch {
      setIsError(true);
      if (silent) toast.error("تعذّر تحديث النسخ الاحتياطية");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  if (isLoading) {
    return (
      <div dir="rtl">
        <BackupsSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center py-20 text-center">
        <ExclamationTriangleIcon
          className="mb-3 h-10 w-10 text-admin-ink-subtle"
          aria-hidden="true"
        />
        <p className="mb-4 text-admin-ink-muted">تعذّر تحميل النسخ الاحتياطية.</p>
        <button
          onClick={() => fetchBackups()}
          className="inline-flex items-center gap-2 rounded-lg bg-admin-brown px-4 py-2 text-sm font-semibold text-admin-on-accent transition-colors hover:bg-admin-brown-hover"
        >
          <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <PageTitle />
        <button
          onClick={() => fetchBackups(true)}
          disabled={isRefreshing}
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg border border-admin-hairline bg-admin-surface px-3.5 py-2 text-sm font-medium text-admin-ink shadow-admin-card transition-colors hover:bg-admin-surface-muted disabled:opacity-60"
        >
          <ArrowPathIcon
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          تحديث
        </button>
      </div>

      <div className="space-y-6">
        <StatusHero data={data} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <GuideCard />
          <SupportCard />
        </div>

        <BackupLog data={data} />
      </div>
    </div>
  );
}
