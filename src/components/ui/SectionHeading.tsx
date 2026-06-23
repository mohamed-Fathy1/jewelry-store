import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  title: string;
  description?: string;
  /** Optional "view all" link rendered to the side (desktop) / below (mobile). */
  link?: { href: string; label: string };
  /** "center" for centered editorial blocks, "between" for title + side link. */
  align?: "center" | "between";
  className?: string;
}

export default function SectionHeading({
  title,
  description,
  link,
  align = "between",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        centered
          ? "flex flex-col items-center text-center"
          : "flex flex-col items-start justify-between gap-5 md:flex-row md:items-end",
        className
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        <h2 className="t-h2 text-pretty font-display text-heading">{title}</h2>
        {description ? (
          <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-ink-muted">
            {description}
          </p>
        ) : null}
      </div>

      {link ? (
        <Link
          href={link.href}
          className="group inline-flex shrink-0 items-center gap-2 border-b border-hairline pb-1 text-sm text-primary transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {link.label}
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      ) : null}
    </div>
  );
}
