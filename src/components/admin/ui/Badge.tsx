import { ReactNode } from "react";
import { statusToken, formatStatusLabel } from "@/constants/adminTheme";

interface BadgeProps {
  children: ReactNode;
  /** Token-driven color; falls back to neutral. */
  tone?: string;
  /** Show a leading status dot. */
  dot?: boolean;
  className?: string;
}

/** Generic pill. Color comes from the shared status token map (one source). */
export function Badge({ children, tone = "default", dot = false, className = "" }: BadgeProps) {
  const t = statusToken(tone);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
      style={{ backgroundColor: t.bg, color: t.text }}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: t.dot }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

/** Status pill: looks up `ADMIN_STATUS_TOKENS` and humanizes the label. */
export function StatusBadge({
  status,
  label,
  dot = true,
}: {
  status: string;
  label?: string;
  dot?: boolean;
}) {
  return (
    <Badge tone={status} dot={dot}>
      {label ?? formatStatusLabel(status)}
    </Badge>
  );
}
