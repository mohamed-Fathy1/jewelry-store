import { ComponentType, ReactNode, SVGProps } from "react";

interface EmptyStateProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description?: string;
  /** Optional CTA (e.g. an admin Button). */
  action?: ReactNode;
}

/** Centered empty/zero-data block with a soft gold icon medallion. */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-admin-hairline bg-admin-surface px-6 py-16 text-center">
      {Icon && (
        <span
          className="mb-4 grid h-12 w-12 place-items-center rounded-full"
          style={{ backgroundColor: "var(--admin-gold-soft)" }}
        >
          <Icon className="h-6 w-6 text-admin-gold" aria-hidden="true" />
        </span>
      )}
      <p className="text-base font-semibold text-admin-heading text-pretty">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-admin-ink-muted text-pretty">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
