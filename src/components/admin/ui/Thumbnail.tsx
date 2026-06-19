"use client";

import { ComponentType, SVGProps, useEffect, useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";

interface ThumbnailProps {
  src?: string | null;
  alt: string;
  /** Sizing for the wrapper, e.g. "h-12 w-12" (default) or "h-48 w-full". */
  className?: string;
  rounded?: string;
  /** Fallback glyph shown when there's no src or the image fails to load. */
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

/**
 * Image thumbnail that gracefully falls back to a branded placeholder when the
 * source is missing or fails to load (corrupted / 404 URLs). Plain <img> so the
 * onError fallback is reliable for arbitrary remote URLs.
 */
export function Thumbnail({
  src,
  alt,
  className = "h-12 w-12",
  rounded = "rounded-md",
  icon: Icon = PhotoIcon,
}: ThumbnailProps) {
  const [failed, setFailed] = useState(false);

  // Reset the error state when the source changes (e.g. row re-use / edit).
  useEffect(() => setFailed(false), [src]);

  const showImage = !!src && !failed;

  return (
    <div
      className={`relative flex flex-shrink-0 items-center justify-center overflow-hidden bg-admin-surface-muted ring-1 ring-admin-hairline ${rounded} ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Icon className="h-1/2 w-1/2 text-admin-ink-subtle" aria-hidden="true" />
      )}
    </div>
  );
}
