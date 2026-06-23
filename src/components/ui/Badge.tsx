import { cn } from "@/lib/cn";

type BadgeVariant = "discount" | "sale" | "bestseller" | "flash" | "soldout";

const variantMap: Record<BadgeVariant, string> = {
  discount: "bg-primary text-on-primary",
  sale: "bg-accent-soft text-heading",
  bestseller: "bg-surface/90 text-heading ring-1 ring-hairline backdrop-blur",
  flash: "bg-accent text-ink",
  soldout: "bg-ink/80 text-on-primary",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({
  children,
  variant = "discount",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
