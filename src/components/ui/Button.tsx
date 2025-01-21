import { ButtonHTMLAttributes, forwardRef } from "react";
import { colors } from "@/constants/colors";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={{
          backgroundColor: variant === "primary" ? colors.brown : "transparent",
          color: variant === "primary" ? colors.textLight : colors.textPrimary,
          border:
            variant === "secondary" ? `1px solid ${colors.border}` : "none",
        }}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
