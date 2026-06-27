"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

function getParts(ms: number) {
  const clamped = Math.max(0, ms);
  const totalSeconds = Math.floor(clamped / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

interface CountdownTimerProps {
  /** ISO date the countdown targets. */
  endDate: string;
  /** Fires once when the countdown reaches zero. */
  onExpire?: () => void;
  className?: string;
}

/**
 * Minimal inline countdown — refined serif numerals that inherit the surrounding
 * text color (no boxed flip-clock). Hydration-safe: server + first client paint
 * render a placeholder, then the tick starts in an effect. When more than a day
 * remains it shows days/hrs/min (no frantic seconds); inside a day it shows
 * hrs/min/sec.
 */
export default function CountdownTimer({
  endDate,
  onExpire,
  className,
}: CountdownTimerProps) {
  const target = useMemo(() => new Date(endDate).getTime(), [endDate]);
  const [remaining, setRemaining] = useState<number | null>(null);

  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const firedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const diff = target - Date.now();
      setRemaining(diff);
      if (diff <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpireRef.current?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const parts = getParts(remaining ?? 0);
  const units =
    parts.days > 0
      ? [
          { label: "Days", value: parts.days },
          { label: "Hrs", value: parts.hours },
          { label: "Min", value: parts.minutes },
        ]
      : [
          { label: "Hrs", value: parts.hours },
          { label: "Min", value: parts.minutes },
          { label: "Sec", value: parts.seconds },
        ];

  const ariaLabel =
    remaining === null
      ? "Loading countdown"
      : remaining <= 0
      ? "Offer ended"
      : `Ends in ${parts.days} days, ${parts.hours} hours and ${parts.minutes} minutes`;

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={ariaLabel}
      className={cn("flex items-start gap-4 sm:gap-6", className)}
    >
      {units.map((u, i) => (
        <div key={u.label} className="flex items-start">
          <div className="flex flex-col items-start">
            <span
              className="font-display text-4xl leading-none tabular-nums sm:text-5xl"
              suppressHydrationWarning
            >
              {remaining === null ? "––" : String(u.value).padStart(2, "0")}
            </span>
            <span className="mt-2.5 text-[10px] uppercase tracking-[0.2em] opacity-50">
              {u.label}
            </span>
          </div>
          {i < units.length - 1 ? (
            <span
              aria-hidden="true"
              className="ml-4 font-display text-3xl leading-none opacity-20 sm:ml-6 sm:text-4xl"
            >
              :
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
