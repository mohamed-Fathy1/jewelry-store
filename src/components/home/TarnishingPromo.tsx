"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const traits = ["Won't tarnish", "Water-safe", "Skin-friendly"];

const TarnishingPromo: React.FC = () => {
  return (
    <section className="bg-noir text-on-primary">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-[var(--section-y)] sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        {/* Copy */}
        <div className="order-2 max-w-xl lg:order-1">
          <p className="mb-6 text-xs uppercase tracking-[0.22em] text-accent">
            Stainless Steel
          </p>
          <h2 className="t-h2 text-balance font-display text-on-primary">
            Made to be worn, not stored.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-on-primary/70">
            Our pieces are high-grade stainless steel — they don&rsquo;t tarnish,
            rust, or change color. Keep them on in the shower, the sea, the
            everyday. They hold their shine.
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-on-primary/65">
            {traits.map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-accent"
                />
                {t}
              </li>
            ))}
          </ul>
          <Link
            href="/shop"
            className="mt-10 inline-flex items-center gap-2 border-b border-accent/40 pb-1 text-sm text-accent transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-noir"
          >
            Explore the collection
          </Link>
        </div>

        {/* Art-directed imagery */}
        <div className="relative order-1 mx-auto w-full max-w-md lg:order-2 lg:mx-0 lg:ml-auto">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-card-hover ring-1 ring-white/10">
            <Image
              src="/images/IMG_3645.jpg"
              alt="Gold necklaces with pendant displayed on a dark surface"
              fill
              sizes="(min-width:1024px) 40vw, 90vw"
              quality={88}
              loading="lazy"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -left-8 hidden aspect-square w-2/5 overflow-hidden rounded-2xl shadow-card-hover ring-1 ring-white/10 sm:block">
            <Image
              src="/images/IMG_5678.jpg"
              alt="Gold ring with opal stone, worn on the hand"
              fill
              sizes="20vw"
              quality={88}
              loading="lazy"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TarnishingPromo;
