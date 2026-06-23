import { cn } from "@/lib/cn";

type SectionSurface = "bg" | "surface" | "muted" | "sunken";

const surfaceMap: Record<SectionSurface, string> = {
  bg: "bg-bg",
  surface: "bg-surface",
  muted: "bg-surface-muted",
  sunken: "bg-surface-sunken",
};

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  /** Background surface token. Defaults to the page canvas. */
  surface?: SectionSurface;
  /** Extra classes on the outer <section> (background, borders, etc.). */
  className?: string;
  /** Extra classes on the inner max-width container. */
  containerClassName?: string;
  /** Drop the default max-width container (for full-bleed sections). */
  bleed?: boolean;
}

/**
 * Editorial section wrapper: consistent vertical rhythm (--section-y) and a
 * centered max-width container. Replaces the repeated
 * `max-w-7xl mx-auto px-4 … py-16` literal across home sections.
 */
export default function Section({
  children,
  id,
  surface = "bg",
  className,
  containerClassName,
  bleed = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("py-[var(--section-y)]", surfaceMap[surface], className)}
    >
      {bleed ? (
        children
      ) : (
        <div
          className={cn(
            "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
            containerClassName
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}
