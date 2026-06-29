import { cn } from "@/lib/cn";

type BadgeVariant =
  | "discount"
  | "sale"
  | "bestseller"
  | "new"
  | "flash"
  | "soldout";
type BadgeSize = "sm" | "md";

const variantMap: Record<BadgeVariant, string> = {
  discount: "bg-primary text-on-primary",
  sale: "bg-accent-soft text-heading",
  bestseller: "bg-surface/90 text-heading ring-1 ring-hairline backdrop-blur",
  new: "bg-ink text-on-primary",
  flash: "bg-accent text-ink",
  soldout: "bg-ink/80 text-on-primary",
};

// Size is split out so callers can pick a compact pill (e.g. a 2-digit
// discount) without relying on className overrides — `cn` is plain clsx with
// no tailwind-merge, so an override class would collide with the base instead
// of replacing it.
const sizeMap: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export default function Badge({
  children,
  variant = "discount",
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold tracking-wide",
        sizeMap[size],
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
