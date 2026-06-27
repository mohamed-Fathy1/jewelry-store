"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import Section from "@/components/ui/Section";
import ProductCard from "@/components/product/ProductCard";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { FlashSale as FlashSaleType } from "@/types/home.types";

interface FlashSaleProps {
  flashSales: FlashSaleType[];
  isLoading?: boolean;
}

const ROTATE_MS = 6000;
const keyOf = (s: FlashSaleType) => s._id ?? `${s.title}__${s.endDate}`;

// Fixed inner height so swapping sales (1 vs 2 products, with/without
// description) never resizes the band → no layout shift.
const BAND = "rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-hover text-on-primary shadow-card";
const PAD = "px-6 py-9 sm:px-10 sm:py-10";

export default function FlashSale({ flashSales, isLoading }: FlashSaleProps) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Sales whose countdown reached zero this session — dropped from the rotation.
  const [expired, setExpired] = useState<string[]>([]);

  const sales = (flashSales || []).filter(
    (s) => s?.products?.length && !expired.includes(keyOf(s))
  );
  const count = sales.length;

  // Auto-advance — a carousel, not arrow-only. Pauses on hover/focus and for
  // visitors who prefer reduced motion.
  useEffect(() => {
    if (count < 2 || paused || reduce) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % count),
      ROTATE_MS
    );
    return () => clearInterval(id);
  }, [count, paused, reduce]);

  // Loading → skeleton (reserves the band). Loaded + empty → render nothing.
  if (isLoading && !count) return <FlashSaleSkeleton />;
  if (!count) return null;

  const idx = Math.min(active, count - 1);
  const sale = sales[idx];
  const products = sale.products.slice(0, 4);
  const many = count > 1;
  const go = (n: number) => setActive(((n % count) + count) % count);

  return (
    <Section>
      <div
        className={cn("relative overflow-hidden", BAND, PAD)}
        aria-roledescription="carousel"
        aria-label="Flash sales"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/12 blur-3xl"
        />

        <div className="relative flex flex-col gap-9 lg:min-h-[25rem] lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          {/* Left: the pitch */}
          <div className="lg:max-w-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-accent-soft/90">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-soft/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-soft" />
                </span>
                Flash Sale
              </span>
              {many && (
                <span className="text-xs tabular-nums text-on-primary/45">
                  {idx + 1} / {count}
                </span>
              )}
            </div>

            {/* Keyed → fades on each advance; height stays fixed by the parent. */}
            <motion.div
              key={keyOf(sale)}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2
                dir="auto"
                className="mt-4 line-clamp-2 text-balance font-display text-3xl leading-[1.12] text-on-primary sm:text-[2.5rem]"
              >
                {sale.title}
              </h2>
              {/* Reserve two lines so present/absent description doesn't shift. */}
              <p
                dir="auto"
                className="mt-3 line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-on-primary/65"
              >
                {sale.description?.trim() || ""}
              </p>

              <div className="mt-6">
                <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-on-primary/45">
                  Ends in
                </p>
                <CountdownTimer
                  endDate={sale.endDate}
                  onExpire={() =>
                    setExpired((prev) => [...prev, keyOf(sale)])
                  }
                  className="text-accent-soft"
                />
              </div>
            </motion.div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href="/shop?sale=true"
                className="inline-flex items-center justify-center rounded-full bg-accent-soft px-7 py-3 text-sm font-medium text-heading transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Shop the offer
              </Link>
              <span className="text-sm text-on-primary/60">
                Up to {Math.round(sale.discountPercentage)}% off
              </span>
            </div>

            {/* Carousel controls */}
            {many && (
              <div className="mt-9 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go(idx - 1)}
                  aria-label="Previous flash sale"
                  className="grid h-9 w-9 place-items-center rounded-full border border-on-primary/20 text-on-primary transition-colors hover:bg-on-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
                >
                  <Chevron dir="left" />
                </button>
                <div className="flex items-center gap-2">
                  {sales.map((s, i) => (
                    <button
                      key={keyOf(s)}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Flash sale ${i + 1}`}
                      aria-current={i === idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === idx
                          ? "w-7 bg-accent-soft"
                          : "w-1.5 bg-on-primary/40 hover:bg-on-primary/70"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => go(idx + 1)}
                  aria-label="Next flash sale"
                  className="grid h-9 w-9 place-items-center rounded-full border border-on-primary/20 text-on-primary transition-colors hover:bg-on-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
                >
                  <Chevron dir="right" />
                </button>
              </div>
            )}
          </div>

          {/* Right: fixed-width column so the card count never reflows the layout */}
          <div className="w-full shrink-0 lg:w-[460px]">
            <motion.div
              key={keyOf(sale)}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduce ? 0 : 0.45 }}
              className={cn(
                "grid gap-4 sm:gap-5",
                products.length === 1
                  ? "mx-auto max-w-[300px] grid-cols-1"
                  : "grid-cols-2"
              )}
            >
              {products.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onDark
                  badge="sale"
                  sizes="(min-width:640px) 220px, 45vw"
                  priority={i === 0}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function FlashSaleSkeleton() {
  return (
    <Section>
      <div className={cn("relative overflow-hidden", BAND, PAD)} aria-hidden="true">
        <div className="flex animate-pulse flex-col gap-9 lg:min-h-[25rem] lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="w-full lg:max-w-sm">
            <div className="h-3 w-28 rounded bg-on-primary/15" />
            <div className="mt-5 h-9 w-3/4 rounded bg-on-primary/15" />
            <div className="mt-4 h-3 w-full max-w-xs rounded bg-on-primary/10" />
            <div className="mt-6 flex gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 w-12 rounded bg-on-primary/15" />
              ))}
            </div>
            <div className="mt-8 h-11 w-40 rounded-full bg-on-primary/15" />
          </div>
          <div className="grid w-full shrink-0 grid-cols-2 gap-4 sm:gap-5 lg:w-[460px]">
            {[0, 1].map((i) => (
              <div key={i}>
                <div className="aspect-square w-full rounded-2xl bg-on-primary/15" />
                <div className="mt-3 h-3 w-2/3 rounded bg-on-primary/10" />
                <div className="mt-2 h-3 w-1/3 rounded bg-on-primary/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={dir === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
      />
    </svg>
  );
}
