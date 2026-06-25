"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import Section from "@/components/ui/Section";

const FEATURES = [
  {
    img: "/images/IMG_3095.JPG",
    title: "Durability",
    text: "Built to last a lifetime.",
  },
  {
    img: "/images/IMG_3177.PNG",
    title: "Rust Resistant",
    text: "Always maintains its shine.",
  },
  {
    img: "/images/IMG_1858.JPG",
    title: "Timeless Style",
    text: "Classic designs that never fade.",
  },
];

export default function AboutPage() {
  const reduceMotion = useReducedMotion();

  // Scroll-reveal that degrades to a static, fully-visible default when the
  // user prefers reduced motion.
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
      <section className="relative h-[58vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src="/images/IMG_0297.JPG"
          alt="A to Z stainless-steel jewelry arranged on a warm neutral surface"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-noir/55" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <motion.h1
            {...(reduceMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 24 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.8, ease: "easeOut" },
                })}
            className="max-w-3xl text-balance text-center font-display t-display text-on-primary"
          >
            About A to Z Accessories
          </motion.h1>
        </div>
      </section>

      {/* Story */}
      <Section surface="bg" containerClassName="max-w-2xl text-center">
        <motion.div
          {...reveal()}
          className="space-y-6 text-pretty text-[17px] leading-relaxed text-ink-muted"
        >
          <p>
            At A to Z Accessories, we specialize in high-quality stainless steel
            accessories designed to withstand the test of time. Our pieces are
            engineered to resist rust and colour change — made for those who
            value durability, style, and quiet confidence.
          </p>
          <p>
            We&rsquo;re passionate about accessories that not only look
            considered but are built to last, no matter the conditions.
          </p>
          <p>
            Ideal for everyday wear, our stainless steel jewelry offers an
            unbeatable combination of strength and elegance.
          </p>
        </motion.div>
      </Section>

      {/* Features */}
      <Section surface="muted" className="border-y border-hairline">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.article
              key={feature.title}
              {...reveal(i * 0.08)}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-card"
            >
              <Image
                src={feature.img}
                alt={feature.title}
                fill
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/85 via-noir/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-on-primary">
                <h3 className="font-display text-2xl">{feature.title}</h3>
                <p className="mt-1 text-sm text-on-primary/80">{feature.text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </Section>
    </div>
  );
}
