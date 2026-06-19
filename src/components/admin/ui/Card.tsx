import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Apply default padding (p-6). Off for tables/media that bleed to the edge. */
  padded?: boolean;
}

/** Cream-luxe surface: white panel, hairline-free, brown-tinted soft shadow. */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padded = true, className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-xl bg-admin-surface shadow-admin-card ring-1 ring-admin-hairline/60 ${
        padded ? "p-6" : ""
      } ${className}`}
      {...props}
    />
  )
);

Card.displayName = "AdminCard";
