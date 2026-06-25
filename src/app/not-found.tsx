import Link from "next/link";

// Branded 404 — replaces the bare Next.js default. Centers within the layout's
// flex-1 <main>, so the sticky footer stays pinned to the viewport bottom.
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-display text-6xl leading-none text-heading sm:text-7xl">
        404
      </p>
      <h1 className="mt-6 font-display text-2xl text-heading">
        This page wandered off
      </h1>
      <p className="mt-3 text-base leading-relaxed text-ink-muted">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
        Let&rsquo;s get you back to something beautiful.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-block rounded-full bg-primary px-8 py-3 text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          Back to home
        </Link>
        <Link
          href="/shop"
          className="inline-block rounded-full border border-hairline px-8 py-3 text-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          Browse the shop
        </Link>
      </div>
    </div>
  );
}
