import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

type Variant = "default" | "danger" | "ghost";
type Size = "sm" | "md";

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** Required — becomes the button's accessible name. */
  label: string;
  icon: ReactNode;
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  default:
    "text-admin-ink-muted hover:text-admin-brown hover:bg-admin-surface-muted",
  danger: "text-admin-ink-muted hover:text-admin-danger hover:bg-admin-surface-muted",
  ghost: "text-admin-ink-muted hover:bg-admin-surface-muted",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 w-8 [&>svg]:h-4 [&>svg]:w-4",
  md: "h-9 w-9 [&>svg]:h-5 [&>svg]:w-5",
};

/**
 * Icon-only button with a mandatory `label` (typed required → no more title-only
 * icon buttons). Themed + keyboard-focusable.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, icon, variant = "default", size = "md", className = "", ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  )
);

IconButton.displayName = "AdminIconButton";
