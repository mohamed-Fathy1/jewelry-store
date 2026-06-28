"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

// Compact, self-contained countdown sized for the product sidebar (the shared
// CountdownTimer renders display-size numerals meant for the homepage band).
function useCountdown(endDate?: string | null) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!endDate) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  if (!endDate || now === null) return null;
  const diff = Math.max(0, new Date(endDate).getTime() - now);
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    ended: diff <= 0,
  };
}

interface ProductFlashSaleProps {
  discountPercentage: number;
  endDate?: string | null;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function ProductFlashSale({
  discountPercentage,
  endDate,
}: ProductFlashSaleProps) {
  const c = useCountdown(endDate);

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-gradient-to-br from-primary/5 via-surface to-accent/10 p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-primary text-on-primary">
          <Zap className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-heading">
            Flash Sale &minus;{discountPercentage}%
          </p>
          <p className="text-xs text-ink-muted">
            Applied automatically at checkout
          </p>
        </div>
      </div>

      {c && !c.ended && (
        <div className="flex flex-none items-baseline gap-1 tabular-nums text-sm font-semibold text-primary">
          {c.days > 0 && <span>{pad(c.days)}d</span>}
          <span>
            {pad(c.hours)}:{pad(c.minutes)}:{pad(c.seconds)}
          </span>
        </div>
      )}
    </div>
  );
}
