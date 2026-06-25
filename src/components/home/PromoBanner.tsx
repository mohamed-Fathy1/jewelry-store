"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { offersService } from "@/services/offers.service";
import { heroService } from "@/services/hero.service";
import { OFFER_TYPE_LABELS } from "@/components/admin/offers/offerMeta";
import type { Offer } from "@/types/offer.types";
import Hero from "./Hero";

// Hero imagery doubles as the banner backdrop (admin-swappable slider → local).
const FALLBACK_DESKTOP = "/hero/hero-desktop.jpg";
const FALLBACK_MOBILE = "/hero/hero-mobile.jpg";
const ROTATE_MS = 4500;
const EASE = [0.22, 1, 0.36, 1] as const;

// `null` = still deciding (fetch in flight); [] = decided, no offers → hero.
type Phase = Offer[] | null;

export default function PromoBanner() {
  const reduce = useReducedMotion();
  const [offers, setOffers] = useState<Phase>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [desktop, setDesktop] = useState(FALLBACK_DESKTOP);
  const [mobile, setMobile] = useState(FALLBACK_MOBILE);

  // Pull the hero slider images for the backdrop (same source as <Hero/>).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await heroService.getHeroImages();
        if (!active || !res?.success) return;
        const slide = (res.data.imageSlider || []).find(
          (s) => s?.images?.image2?.mediaUrl || s?.images?.image1?.mediaUrl
        );
        if (!slide) return;
        const d =
          slide.images?.image2?.mediaUrl || slide.images?.image1?.mediaUrl;
        const m =
          slide.images?.image1?.mediaUrl || slide.images?.image2?.mediaUrl;
        if (d) setDesktop(d);
        if (m) setMobile(m);
      } catch {
        /* keep local fallbacks */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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

  // Decided there are no live offers → the regular hero (graceful fallback).
  if (offers && offers.length === 0) return <Hero />;

  // offers === null → still fetching: render the banner shell + a skeleton so
  // the Hero never flashes in before the offer copy arrives.
  const loading = offers === null;
  const offer = loading ? null : offers![Math.min(index, offers!.length - 1)];
  const kicker = offer
    ? OFFER_TYPE_LABELS[offer.offerType] ?? "Featured offer"
    : "";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promotional offers"
      className="relative h-[90vh] min-h-[560px] w-full overflow-hidden bg-noir text-on-primary"
      // Pause only on keyboard focus (using the controls) — not on hover, since
      // a full-bleed banner is almost always under the cursor and would never
      // advance.
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Background — the hero flat-lay imagery (responsive) with a slow drift,
          a centred vignette for legibility, and a champagne glow for warmth. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 hidden md:block"
        animate={reduce ? undefined : { scale: [1, 1.07] }}
        transition={
          reduce
            ? undefined
            : {
                duration: 20,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
              }
        }
      >
        <Image
          src={desktop}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={88}
          className="object-cover"
        />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 md:hidden"
        animate={reduce ? undefined : { scale: [1, 1.07] }}
        transition={
          reduce
            ? undefined
            : {
                duration: 20,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
              }
        }
      >
        <Image
          src={mobile}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover object-center"
        />
      </motion.div>

      {/* Scrims: a mild overall tint, a centred vignette that darkens behind the
          copy while letting the jewellery read at the edges, a bottom anchor for
          the dots, and a champagne glow up top. */}
      <div aria-hidden="true" className="absolute inset-0 bg-noir/30" />
      <div
        aria-hidden="true"
        className="absolute inset-0 [background:radial-gradient(62%_62%_at_50%_50%,rgba(28,21,15,0.68),transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-noir/65 via-transparent to-noir/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 [background:radial-gradient(820px_440px_at_50%_16%,rgba(176,136,76,0.18),transparent_70%)]"
      />

      {/* Copy — animates per offer (or a skeleton while offers load). */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="mx-auto w-full max-w-3xl px-6 text-center">
          {loading ? (
            <div className="flex animate-pulse flex-col items-center">
              <div className="h-7 w-36 rounded-full bg-on-primary/15" />
              <div className="mt-6 h-9 w-80 max-w-full rounded bg-on-primary/15" />
              <div className="mt-3 h-9 w-64 max-w-full rounded bg-on-primary/15" />
              <div className="mt-6 h-4 w-72 max-w-full rounded bg-on-primary/10" />
              <div className="mt-9 h-12 w-40 rounded-full bg-on-primary/15" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={offer!._id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -18 }}
                transition={{ duration: reduce ? 0.2 : 0.6, ease: EASE }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-noir/30 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-accent backdrop-blur-sm">
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  {kicker}
                </span>

                <h2 className="t-h2 mt-6 text-balance font-display text-on-primary [text-shadow:0_2px_28px_rgba(20,15,11,0.45)]">
                  {offer!.title}
                </h2>

                {offer!.description?.trim() && (
                  <p className="mx-auto mt-5 line-clamp-2 max-w-xl text-base leading-relaxed text-on-primary/85 [text-shadow:0_1px_18px_rgba(20,15,11,0.55)] sm:text-lg">
                    {offer!.description}
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
          )}
        </div>
      </div>

      {/* Controls — only when there's more than one offer to move between. */}
      {!loading && offers!.length > 1 && (
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
            {offers!.map((o, i) => (
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
