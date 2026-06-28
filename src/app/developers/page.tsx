"use client";

import { motion, useReducedMotion } from "framer-motion";
import Section from "@/components/ui/Section";

/* ── studio + team ─────────────────────────────────────────────────────── */
const STUDIO = "Tiqni";

type Member = {
  initials: string;
  name: string;
  role: string;
  blurb: string;
  linkedin?: string; // fill in with the real profile URLs
  whatsappIntl: string; // wa.me format (country code + number, no leading 0)
  whatsappDisplay: string;
};

const TEAM: Member[] = [
  {
    initials: "AZ",
    name: "Abdulrahman Mohamed Zaki",
    role: "Full-Stack Developer",
    blurb:
      "Designed and engineered the storefront end-to-end — the design system, the React architecture, and the API integration that powers it.",
    linkedin: "#",
    whatsappIntl: "201025502697",
    whatsappDisplay: "+20 102 550 2697",
  },
  {
    initials: "MF",
    name: "Mohamed Fathy",
    role: "Frontend & UI Developer",
    blurb:
      "Crafted the interface and user experience — turning the design system into pixel-perfect, responsive React components and refined interactions.",
    linkedin: "#",
    whatsappIntl: "201010400891",
    whatsappDisplay: "+20 101 040 0891",
  },
];

/* ── brand glyphs ──────────────────────────────────────────────────────── */
function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

export default function DevelopersPage() {
  const reduceMotion = useReducedMotion();

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.7, ease: "easeOut", delay },
        };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-noir text-on-primary">
        {/* soft gold glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.35), transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto flex min-h-[46vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
          <motion.p
            {...(reduceMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 16 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.6, ease: "easeOut" },
                })}
            className="text-xs font-semibold uppercase tracking-[0.32em] text-accent"
          >
            Behind the Scenes
          </motion.p>
          <motion.h1
            {...(reduceMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 24 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.8, ease: "easeOut", delay: 0.05 },
                })}
            className="mt-4 font-display t-display text-on-primary"
          >
            Meet the Developers
          </motion.h1>
          <motion.p
            {...(reduceMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 24 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.8, ease: "easeOut", delay: 0.12 },
                })}
            className="mt-5 max-w-xl text-pretty text-[17px] leading-relaxed text-on-primary/70"
          >
            The A&nbsp;to&nbsp;Z storefront was crafted by a small team obsessed with
            detail — blending refined design with reliable engineering.
          </motion.p>
        </div>
      </section>

      {/* How it was built */}
      <Section surface="bg" containerClassName="max-w-2xl text-center">
        <motion.div {...reveal()}>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            The craft
          </p>
          <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
            How A to Z was built
          </h2>
          <p className="mt-6 text-pretty text-[17px] leading-relaxed text-ink-muted">
            From the first wireframe to the final pixel, A&nbsp;to&nbsp;Z was built as a
            luxury experience first. Every animation, every curve, and every interaction
            was tuned by hand — backed by a fast, type-safe React architecture that keeps
            the store reliable as it grows.
          </p>
        </motion.div>
      </Section>

      {/* Team */}
      <Section surface="muted" className="border-y border-hairline">
        <motion.div {...reveal()} className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            The team
          </p>
          <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
            The people who shipped this storefront
          </h2>
          <p className="mt-4 text-sm text-ink-muted">
            Designed, engineered, and shipped by {STUDIO}.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {TEAM.map((m, i) => (
            <motion.article
              key={m.name}
              {...reveal(i * 0.1)}
              className="group relative overflow-hidden rounded-2xl bg-surface p-7 shadow-card ring-1 ring-hairline transition-shadow hover:shadow-card-hover"
            >
              {/* gold top accent on hover */}
              <span
                className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100"
                aria-hidden="true"
              />
              <div className="flex items-center gap-4">
                <span
                  className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-full font-display text-xl text-on-primary ring-2 ring-accent/30"
                  style={{ background: "linear-gradient(140deg, #1c1c1c, #3a2a18)" }}
                >
                  {m.initials}
                </span>
                <div>
                  <h3 className="font-display text-xl text-ink">{m.name}</h3>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                    {m.role}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-[15px] leading-relaxed text-ink-muted">{m.blurb}</p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {m.linkedin && (
                  <a
                    href={m.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-noir px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-noir/85"
                  >
                    <LinkedInIcon className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                <a
                  href={`https://wa.me/${m.whatsappIntl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-on-primary transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: "#25D366" }}
                  dir="ltr"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {m.whatsappDisplay}
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </Section>

      {/* Studio sign-off */}
      <Section surface="bg" containerClassName="text-center">
        <motion.p {...reveal()} className="text-sm text-ink-muted">
          Developed &amp; designed by{" "}
          <span className="font-display text-base text-ink">{STUDIO}</span>
        </motion.p>
      </Section>
    </div>
  );
}
