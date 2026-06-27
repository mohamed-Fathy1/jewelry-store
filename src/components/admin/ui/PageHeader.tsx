import { ComponentType, ReactNode, SVGProps } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned actions (filters, "New" button…). */
  actions?: ReactNode;
}

/** Editorial page title: italic serif heading + muted subtitle, balanced. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1
          className="text-pretty text-3xl font-normal italic tracking-tight text-admin-heading"
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-admin-ink-muted text-pretty">{description}</p>
        )}
        <div
          className="mt-3 h-px w-16 rounded-full"
          style={{ backgroundColor: "var(--admin-gold)" }}
          aria-hidden="true"
        />
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Panel/section title with optional accent icon. */
export function SectionHeading({
  icon: Icon,
  children,
  accent = "brown",
}: {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  children: ReactNode;
  accent?: "brown" | "gold";
}) {
  return (
    <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-admin-heading">
      {Icon && (
        <Icon
          className={`h-5 w-5 ${accent === "gold" ? "text-admin-gold" : "text-admin-brown"}`}
          aria-hidden="true"
        />
      )}
      {children}
    </h2>
  );
}
