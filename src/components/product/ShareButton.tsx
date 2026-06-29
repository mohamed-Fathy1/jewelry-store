"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Link2, Check } from "lucide-react";
import { FaWhatsapp, FaFacebookF, FaTelegram, FaXTwitter } from "react-icons/fa6";
import toast from "react-hot-toast";
import { cn } from "@/lib/cn";

type ShareButtonProps = {
  /** Product title used in the share text. */
  title: string;
  /** Short description shared alongside the link (image/desc come from OG tags). */
  text?: string;
  /**
   * The URL to share. Should be the backend OG-preview endpoint
   * (…/products/share/:id), NOT the storefront page — social crawlers don't run
   * the client app, so only the server-rendered endpoint yields a rich card.
   * Falls back to the current page URL.
   */
  shareUrl?: string;
  /** Optional text label rendered next to the icon. */
  label?: string;
  /**
   * Visual weight of the trigger:
   * - "pill" (default): bordered, full-width button.
   * - "ghost": a quiet inline link that doesn't compete with primary actions.
   */
  variant?: "pill" | "ghost";
  /** Applied to the wrapper so callers control layout (e.g. flex-1). */
  className?: string;
};

export default function ShareButton({
  title,
  text,
  shareUrl: shareUrlProp,
  label,
  variant = "pill",
  className,
}: ShareButtonProps) {
  const isGhost = variant === "ghost";
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(shareUrlProp ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  // Prefer the explicit share endpoint; fall back to the current page URL only
  // when none was provided (keeps the component usable elsewhere).
  useEffect(() => {
    if (shareUrlProp) {
      setShareUrl(shareUrlProp);
    } else if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, [shareUrlProp]);

  // Close the menu on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shareMessage = text ? `${title}\n${text}` : title;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedMsg = encodeURIComponent(shareMessage);

  // On mobile, prefer the native share sheet (WhatsApp, Instagram, etc.).
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: shareMessage, url: shareUrl });
        return;
      } catch {
        // User dismissed the sheet, or it failed — fall back to the menu.
      }
    }
    setOpen((v) => !v);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("تم نسخ الرابط");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("تعذّر نسخ الرابط");
    }
    setOpen(false);
  };

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${shareMessage}\n${shareUrl}`)}`,
      icon: <FaWhatsapp className="h-5 w-5 text-[#25D366]" />,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <FaFacebookF className="h-5 w-5 text-[#1877F2]" />,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMsg}`,
      icon: <FaTelegram className="h-5 w-5 text-[#229ED9]" />,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedMsg}`,
      icon: <FaXTwitter className="h-5 w-5 text-ink" />,
    },
  ];

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share product"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "group inline-flex items-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          isGhost
            ? "rounded-full py-1.5 text-sm font-medium text-ink-muted hover:text-heading"
            : cn(
                "w-full justify-center rounded-full border border-hairline bg-surface py-3 text-sm font-medium text-ink hover:border-hairline-strong hover:bg-surface-muted",
                label ? "px-5" : "px-3"
              )
        )}
      >
        <Share2
          className={cn(
            "transition-transform duration-200 group-hover:scale-110 group-active:scale-90",
            isGhost ? "h-4 w-4" : "h-5 w-5"
          )}
        />
        {label && <span>{label}</span>}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-20 w-56 overflow-hidden rounded-2xl border border-hairline bg-surface shadow-card-hover ring-1 ring-noir/5 motion-safe:animate-[sheetUp_180ms_cubic-bezier(0.22,1,0.36,1)]",
            isGhost
              ? "bottom-full left-1/2 mb-2 -translate-x-1/2 origin-bottom"
              : "right-0 mt-2 origin-top-right"
          )}
        >
          <p className="px-4 pt-3 pb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
            مشاركة المنتج
          </p>
          <div className="grid grid-cols-4 gap-1 px-3 pb-2">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                title={l.label}
                aria-label={l.label}
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-1.5 rounded-xl py-2.5 text-ink transition-colors hover:bg-surface-muted"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-muted transition-transform duration-200 hover:scale-110">
                  {l.icon}
                </span>
              </a>
            ))}
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className="flex w-full items-center gap-3 border-t border-hairline px-4 py-3 text-sm text-ink transition-colors hover:bg-surface-muted"
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Link2 className="h-5 w-5 text-ink-muted" />
            )}
            <span>{copied ? "تم النسخ" : "نسخ الرابط"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
