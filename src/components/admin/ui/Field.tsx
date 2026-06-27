import { ReactNode } from "react";

/** Shared input/select/textarea class for admin forms. */
export const adminInputClass =
  "block w-full rounded-md border border-admin-hairline bg-admin-surface px-3 py-2 text-sm text-admin-ink transition-colors placeholder:text-admin-ink-subtle disabled:opacity-50";

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Labeled form field with optional required marker, inline error and hint. */
export function Field({ label, htmlFor, required, error, hint, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-admin-ink">
        {label}
        {required && (
          <span className="text-admin-danger" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-admin-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-admin-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}
