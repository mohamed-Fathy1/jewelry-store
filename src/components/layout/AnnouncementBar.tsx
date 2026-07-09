"use client";

import { useEffect, useMemo, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useReducedMotion } from "framer-motion";
import { useShipping } from "@/hooks/useShipping";

export default function AnnouncementBar() {
  const { minCost } = useShipping();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);

  const messages = useMemo(
    () => [
      "Open & check before payment",
      minCost != null
        ? `Nationwide delivery from EGP ${minCost.toLocaleString()}`
        : "Nationwide delivery across Egypt",
      "Cash on delivery available",
    ],
    [minCost]
  );

  useEffect(() => {
    const id = setInterval(() => {
      if (reduceMotion) {
        setIndex((i) => (i + 1) % messages.length);
        return;
      }
      setFade(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length);
        setFade(false);
      }, 400);
    }, 5000);
    return () => clearInterval(id);
  }, [reduceMotion, messages.length]);

  if (!visible) return null;

  return (
    <div className="relative bg-primary text-on-primary">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-10 py-2.5">
        <p
          aria-live="off"
          className={`text-center text-xs font-medium tracking-wide sm:text-sm ${
            reduceMotion
              ? ""
              : `transition-opacity duration-300 ${
                  fade ? "opacity-0" : "opacity-100"
                }`
          }`}
        >
          {messages[index]}
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Dismiss announcement"
          className="absolute right-2 grid h-7 w-7 place-items-center rounded-full text-on-primary/80 transition-colors hover:bg-white/10 hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
