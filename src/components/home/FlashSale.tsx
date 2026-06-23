"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import Section from "@/components/ui/Section";
import ProductCard from "@/components/product/ProductCard";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { FlashSale as FlashSaleType } from "@/types/home.types";

interface FlashSaleProps {
  flashSale: FlashSaleType | null;
}

export default function FlashSale({ flashSale }: FlashSaleProps) {
  // Starts false → server and first client render agree (hydration-safe).
  const [expired, setExpired] = useState(false);

  if (!flashSale || !flashSale.products?.length || expired) return null;

  const products = flashSale.products.slice(0, 3);
  const single = products.length === 1;

  return (
    <Section>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-hover px-7 py-12 text-on-primary shadow-card sm:px-12 sm:py-14">
        {/* Soft warm glow — atmosphere, not decoration */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-accent/12 blur-3xl"
        />

        <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy + countdown */}
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accent-soft/80">
              Flash Sale
            </p>
            <h2
              dir="auto"
              className="mt-5 text-balance font-display text-3xl leading-[1.12] text-on-primary sm:text-[2.5rem]"
            >
              {flashSale.title}
            </h2>
            {flashSale.description ? (
              <p
                dir="auto"
                className="mt-4 max-w-md leading-relaxed text-on-primary/70"
              >
                {flashSale.description}
              </p>
            ) : null}

            <div className="mt-9">
              <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-on-primary/50">
                Ends in
              </p>
              <CountdownTimer
                endDate={flashSale.endDate}
                onExpire={() => setExpired(true)}
                className="text-accent-soft"
              />
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link
                href="/shop?sale=true"
                className="inline-flex items-center justify-center rounded-full bg-accent-soft px-8 py-3.5 text-sm font-medium text-heading transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Shop the offer
              </Link>
              <span className="text-sm text-on-primary/70">
                Up to {Math.round(flashSale.discountPercentage)}% off · limited
                time
              </span>
            </div>
          </div>

          {/* Featured product(s) */}
          <div
            className={cn(
              single
                ? "mx-auto w-full max-w-sm lg:mx-0 lg:ml-auto"
                : "grid grid-cols-2 gap-5 sm:grid-cols-3"
            )}
          >
            {products.map((product, i) => (
              <ProductCard
                key={product._id}
                product={product}
                onDark
                badge="sale"
                sizes={
                  single
                    ? "(min-width:1024px) 24rem, 80vw"
                    : "(min-width:1024px) 18vw, 40vw"
                }
                priority={i === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
