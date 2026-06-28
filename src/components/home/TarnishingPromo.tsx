"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

const traits = ["Won't tarnish", "Water-safe", "Skin-friendly"];

// Default video, shown immediately and used whenever the admin hasn't uploaded
// one (or the API is unreachable). Keeping it as the initial state means the
// promo always has a playing video — no blank box while the fetch resolves.
const FALLBACK_VIDEO = "https://d1xdt7gkixoxw1.cloudfront.net/IMG_1602.mp4";

const TarnishingPromo: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState(FALLBACK_VIDEO);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch the admin-set promo video from the public endpoint (visible in the
  // browser Network tab). Falls back silently to FALLBACK_VIDEO on any failure.
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) return;
    // Strip any trailing slash so we never produce `//public/...` — a double
    // slash doesn't match the `/public` mount and falls through to the auth
    // middleware, which 401s. (NEXT_PUBLIC_API_URL ends with `/` in prod.)
    const base = API_URL.replace(/\/+$/, "");
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${base}/public/video/get`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        if (active && json?.success && json?.data?.video?.mediaUrl) {
          setVideoUrl(json.data.video.mediaUrl);
        }
      } catch {
        // keep the fallback
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // React doesn't always apply the `muted` attribute before the first play
  // attempt, which makes the browser block muted autoplay. Force it via the ref
  // and (re)start playback whenever the source changes.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const played = v.play();
    if (played) played.catch(() => {});
  }, [videoUrl]);

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
            <video
              ref={videoRef}
              key={videoUrl}
              src={videoUrl}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/IMG_3645.jpg"
              aria-label="Stainless steel jewelry collection"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TarnishingPromo;
