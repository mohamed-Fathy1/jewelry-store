/**
 * Arabic date/time helpers for the backups page.
 *
 * Intl with the `ar-EG` locale renders Arabic-Indic digits (٢٧) which we don't
 * want here — the design uses Western digits (27, 2026, 9:09). So we format with
 * Arabic month/period words but keep Latin numerals, all in the viewer's local
 * timezone (the page tells the admin "times are shown in your local time").
 */

const AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

/** "يونيو 27, 2026 · 9:09 ص" — local timezone, Latin digits. */
export function formatArabicDateTime(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "—";

  const month = AR_MONTHS[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const period = hours < 12 ? "ص" : "م";
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${month} ${day}, ${year} · ${hours}:${minutes} ${period}`;
}

/**
 * "منذ 16 ساعة تقريباً" / "منذ يوم واحد" / "منذ 3 أيام" / "منذ 16 يوم".
 * Mirrors Arabic plural grammar: 1 → مفرد، 2 → مثنى، 3–10 → جمع قلة، 11+ → تمييز مفرد.
 */
export function formatArabicRelative(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "—";

  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return "الآن";

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (minutes < 1) return "الآن";
  if (hours < 1) return "منذ أقل من ساعة";
  if (hours < 24) {
    if (hours === 1) return "منذ ساعة تقريباً";
    if (hours === 2) return "منذ ساعتين تقريباً";
    return `منذ ${hours} ساعة تقريباً`;
  }

  if (days === 1) return "منذ يوم واحد";
  if (days === 2) return "منذ يومين";
  if (days <= 10) return `منذ ${days} أيام`;
  return `منذ ${days} يوم`;
}
