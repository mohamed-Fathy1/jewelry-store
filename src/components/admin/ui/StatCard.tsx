import { ComponentType, SVGProps } from "react";
import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Optional secondary line under the value. */
  hint?: string;
}

/** Dashboard metric tile: gold-on-brown icon chip, muted label, tabular figure. */
export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-lg"
        style={{ backgroundColor: "var(--admin-brown-soft)" }}
      >
        <Icon className="h-5 w-5 text-admin-brown" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="line-clamp-2 text-xs font-medium uppercase leading-tight tracking-wide text-admin-ink-muted">
          {label}
        </p>
        <p className="tabular mt-1 truncate text-xl font-semibold text-admin-heading">
          {value}
        </p>
        {hint && (
          <p className="tabular mt-0.5 truncate text-xs text-admin-ink-subtle">
            {hint}
          </p>
        )}
      </div>
    </Card>
  );
}
