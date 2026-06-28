import Link from "next/link";

const linkColumns: { heading: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    heading: "Shop",
    links: [
      { label: "Shop all", href: "/shop" },
      { label: "On sale", href: "/shop?sale=true" },
      { label: "New arrivals", href: "/shop" },
      { label: "Categories", href: "/#featured-categories" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Exchange policy", href: "/exchange-policy" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "WhatsApp us", href: "https://wa.me/201044698713", external: true },
      {
        label: "Instagram",
        href: "https://www.instagram.com/a.to.zaccessories",
        external: true,
      },
    ],
  },
];

const footerLink =
  "text-sm text-on-primary/65 underline-offset-4 transition-colors hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-noir rounded-sm";

export default function Footer() {
  return (
    <footer className="bg-noir text-on-primary">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <p className="font-display text-2xl text-on-primary">
              A to Z Accessories
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-on-primary/60">
              Everyday fine jewelry in stainless steel — made to be worn, made
              to last.
            </p>
            <div className="mt-7 flex gap-3">
              <a
                href="https://www.instagram.com/a.to.zaccessories"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow A to Z Accessories on Instagram"
                className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-white/15 text-on-primary/80 transition-colors hover:text-on-primary hover:ring-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" className="h-5 w-5">
                  <path d="M349.33,69.33a93.62,93.62,0,0,1,93.34,93.34V349.33a93.62,93.62,0,0,1-93.34,93.34H162.67a93.62,93.62,0,0,1-93.34-93.34V162.67a93.62,93.62,0,0,1,93.34-93.34H349.33m0-37.33H162.67C90.8,32,32,90.8,32,162.67V349.33C32,421.2,90.8,480,162.67,480H349.33C421.2,480,480,421.2,480,349.33V162.67C480,90.8,421.2,32,349.33,32Z" />
                  <path d="M377.33,162.67a28,28,0,1,1,28-28A27.94,27.94,0,0,1,377.33,162.67Z" />
                  <path d="M256,181.33A74.67,74.67,0,1,1,181.33,256,74.75,74.75,0,0,1,256,181.33M256,144A112,112,0,1,0,368,256,112,112,0,0,0,256,144Z" />
                </svg>
              </a>
              <a
                href="https://wa.me/201044698713"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Message A to Z Accessories on WhatsApp"
                className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-white/15 text-on-primary/80 transition-colors hover:text-on-primary hover:ring-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" className="h-5 w-5">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {linkColumns.map((col) => (
            <div key={col.heading} className="md:col-span-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-on-primary/45">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={footerLink}
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className={footerLink}>
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-on-primary/45">
            © {new Date().getFullYear()} A to Z Accessories. All rights reserved.
          </p>
          <p className="text-xs uppercase tracking-[0.16em] text-on-primary/40">
            Stainless steel · Won&rsquo;t tarnish
          </p>
        </div>

        {/* Developer credit */}
        <div className="mt-6 text-center">
          <p className="text-xs text-on-primary/40">
            Developed &amp; designed by{" "}
            <Link
              href="/developers"
              className="font-medium text-on-primary/70 transition-colors hover:text-accent"
            >
              Tiqni
            </Link>
            <span className="mx-2 text-on-primary/25" aria-hidden="true">
              ·
            </span>
            <Link
              href="/developers"
              className="underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              Meet the developers →
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
