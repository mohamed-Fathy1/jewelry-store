"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { heroService } from "@/services/hero.service";

// Local fallbacks (shown immediately + if the slider is empty / fetch fails).
const FALLBACK_DESKTOP = "/hero/hero-desktop.jpg";
const FALLBACK_MOBILE = "/hero/hero-mobile.jpg";
const EASE = [0.22, 1, 0.36, 1] as const;
const ALT =
  "A flat-lay of fine gold jewelry — necklaces, bangles, hoops and rings on cream";

export default function Hero() {
  const reduce = useReducedMotion();
  // image2 = large (desktop), image1 = small (mobile) — admin-swappable.
  const [desktop, setDesktop] = useState(FALLBACK_DESKTOP);
  const [mobile, setMobile] = useState(FALLBACK_MOBILE);

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

  const rise = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section
      className="relative h-[90vh] min-h-[560px] w-full overflow-hidden bg-bg"
      aria-label="Featured collection"
    >
      {/* Desktop image */}
      <div className="absolute inset-0 hidden md:block">
        <Image
          src={desktop}
          alt={ALT}
          fill
          priority
          sizes="100vw"
          quality={88}
          className="object-cover"
        />
      </div>
      {/* Mobile image */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src={mobile}
          alt={ALT}
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover object-center"
        />
      </div>

      {/* Light scrims keep the bright, airy aesthetic while making the copy
          legible: left wash on desktop, bottom wash on mobile. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-gradient-to-r from-bg via-bg/55 to-transparent md:block"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-bg via-bg/35 to-transparent md:hidden"
      />

      {/* Copy */}
      <div className="absolute inset-0 flex items-end md:items-center">
        <div className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 md:pb-0 lg:px-8">
          <div className="max-w-lg">
            <motion.p
              {...rise(0)}
              className="mb-5 text-xs uppercase tracking-[0.24em] text-accent"
            >
              Fine everyday jewelry
            </motion.p>
            <motion.h1
              {...rise(0.08)}
              className="t-display text-balance font-display text-heading"
            >
              Quiet pieces,
              <br />
              worn every day.
            </motion.h1>
            <motion.p
              {...rise(0.16)}
              className="mt-6 max-w-md text-lg leading-relaxed text-ink-muted"
            >
              Stainless steel that never tarnishes — made for the everyday and
              the occasion alike.
            </motion.p>
            <motion.div
              {...rise(0.24)}
              className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4"
            >
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                Shop the collection
              </Link>
              <Link
                href="/#featured-categories"
                className="rounded text-sm text-ink underline decoration-hairline-strong underline-offset-[6px] transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                Shop by category
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
