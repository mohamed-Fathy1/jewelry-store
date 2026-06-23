"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

interface SmartImageProps extends Omit<ImageProps, "onError"> {
  /** Short mark shown when the image fails to load (e.g. a category initial). */
  fallbackLabel?: string;
  fallbackClassName?: string;
}

/**
 * next/image with a graceful fallback. Seed/CDN images sometimes 404; instead of
 * a broken <img> with alt text bleeding through, we render a muted tile with a
 * quiet serif mark. Use inside a `relative` `fill` container.
 */
export default function SmartImage({
  fallbackLabel = "A·Z",
  fallbackClassName,
  alt,
  className,
  ...props
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "absolute inset-0 grid place-items-center bg-surface-sunken",
          fallbackClassName
        )}
        aria-hidden="true"
      >
        <span className="font-display text-2xl tracking-wide text-ink-subtle/55">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
