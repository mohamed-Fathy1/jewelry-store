"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { offersService } from "@/services/offers.service";
import { OFFER_TYPE_LABELS } from "@/components/admin/offers/offerMeta";
import type { Offer } from "@/types/offer.types";
import Hero from "./Hero";

const ROTATE_MS = 4500;
const EASE = [0.22, 1, 0.36, 1] as const;

// `null` = still deciding (fetch in flight); [] = decided, no offers → hero.
type Phase = Offer[] | null;

export default function PromoBanner() {
  const reduce = useReducedMotion();
  const [offers, setOffers] = useState<Phase>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const list = await offersService.getActiveOffers();
      if (!active) return;
      // Only surface offers that are genuinely live and have copy to show.
      setOffers(
        list.filter((o) => o.isActive && o.status === "active" && o.title?.trim())
      );
    })();
    return () => {
      active = false;
    };
  }, []);

  const count = offers?.length ?? 0;

  // Auto-rotate between offers (paused on hover/focus or reduced motion).
  useEffect(() => {
    if (count < 2 || paused || reduce) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % count),
      ROTATE_MS
    );
    return () => clearInterval(id);
  }, [count, paused, reduce]);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  // Loading or no offers → the regular hero. This is the graceful fallback.
  if (!offers || offers.length === 0) return <Hero />;

  const offer = offers[Math.min(index, offers.length - 1)];
  const kicker = OFFER_TYPE_LABELS[offer.offerType] ?? "Featured offer";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promotional offers"
      className="relative h-[58vh] min-h-[420px] w-full overflow-hidden bg-noir text-on-primary md:h-[88vh] md:min-h-[560px]"
      // Pause only on keyboard focus (using the controls) — not on hover, since
      // a full-bleed banner is almost always under the cursor and would never
      // advance.
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Background — a static warm gradient with a champagne glow (no imagery). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-noir via-primary/80 to-noir"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 [background:radial-gradient(800px_420px_at_50%_18%,rgba(176,136,76,0.22),transparent_70%)]"
      />

      {/* Copy — animates per offer. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="mx-auto w-full max-w-3xl px-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={offer._id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -18 }}
              transition={{ duration: reduce ? 0.2 : 0.6, ease: EASE }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-noir/30 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-accent backdrop-blur-sm">
                <span className="h-1 w-1 rounded-full bg-accent" />
                {kicker}
              </span>

              <h2 className="t-h2 mt-6 text-balance font-display text-on-primary">
                {offer.title}
              </h2>

              {offer.description?.trim() && (
                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-on-primary/75 sm:text-lg">
                  {offer.description}
                </p>
              )}

              <Link
                href="/shop"
                className="mt-9 inline-flex items-center justify-center rounded-full bg-on-primary px-9 py-3.5 text-sm font-medium text-noir shadow-card-hover transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-noir"
              >
                Shop Now
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls — only when there's more than one offer to move between. */}
      {offers.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous offer"
            className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 grid-cols-1 place-items-center rounded-full border border-on-primary/20 bg-noir/30 p-3 text-on-primary backdrop-blur-sm transition-colors hover:bg-noir/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:grid"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next offer"
            className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 grid-cols-1 place-items-center rounded-full border border-on-primary/20 bg-noir/30 p-3 text-on-primary backdrop-blur-sm transition-colors hover:bg-noir/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:grid"
          >
            <ChevronRight />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5">
            {offers.map((o, i) => (
              <button
                key={o._id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to offer ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-7 bg-accent"
                    : "w-1.5 bg-on-primary/40 hover:bg-on-primary/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
