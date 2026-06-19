import { HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

/** Card-wrapped, horizontally-scrollable table surface with hairline rules. */
export function TableShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-xl bg-admin-surface shadow-admin-card ring-1 ring-admin-hairline/60 ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">{children}</table>
      </div>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-admin-hairline bg-admin-surface-muted">{children}</thead>
  );
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-admin-hairline">{children}</tbody>;
}

export function Th({ children, className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-admin-ink-muted ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-6 py-4 align-middle text-sm text-admin-ink ${className}`} {...props}>
      {children}
    </td>
  );
}

export function Tr({ children, className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`transition-colors hover:bg-admin-surface-muted ${className}`} {...props}>
      {children}
    </tr>
  );
}
