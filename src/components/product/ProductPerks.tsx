import Link from "next/link";
import { Gem, ShieldCheck, Tag } from "lucide-react";

// Reassurance + cross-sell row shown under the buy buttons. Static, presentational
// — the same trio on every product. Labels kept in English to match the rest of
// the storefront copy.
const PERKS = [
  {
    icon: Gem,
    title: "Unmatched Quality",
    desc: "Stainless steel that never tarnishes — made to last.",
    href: undefined as string | undefined,
  },
  {
    icon: ShieldCheck,
    title: "Safe Return Policy",
    desc: "Secure, hassle-free returns within the policy window.",
    href: undefined,
  },
  {
    icon: Tag,
    title: "Exclusive Offers",
    desc: "Discover live deals and seasonal discounts.",
    href: "/shop?sale=true",
  },
];

export default function ProductPerks() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {PERKS.map(({ icon: Icon, title, desc, href }) => {
        const inner = (
          <>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-muted text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-medium text-heading">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">{desc}</p>
          </>
        );

        const base =
          "flex flex-col rounded-xl border border-hairline bg-surface p-4 transition-colors";

        return href ? (
          <Link
            key={title}
            href={href}
            className={`${base} hover:border-primary/40 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
          >
            {inner}
          </Link>
        ) : (
          <div key={title} className={base}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
