import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-admin-brown text-admin-on-accent hover:bg-admin-brown-hover border border-transparent",
  secondary:
    "bg-admin-surface text-admin-ink border border-admin-hairline hover:bg-admin-surface-muted",
  ghost:
    "bg-transparent text-admin-ink border border-transparent hover:bg-admin-surface-muted",
  danger:
    "bg-admin-danger text-admin-on-accent hover:bg-admin-danger-hover border border-transparent",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
};

/**
 * Admin button. Separate from the storefront `ui/Button` so the storefront is
 * never affected. Themed with `admin-*` tokens; keyboard focus handled by the
 * scoped `:focus-visible` ring in admin-theme.css.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        leftIcon && (
          <span className="shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}
      {children}
      {rightIcon && !loading && (
        <span className="shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  )
);

Button.displayName = "AdminButton";
