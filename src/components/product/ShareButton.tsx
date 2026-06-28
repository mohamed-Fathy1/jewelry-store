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
  className?: string;
};

export default function ShareButton({ title, text, className }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // The canonical product URL is whatever the visitor is currently viewing —
  // social platforms read the page's Open Graph tags from it for the preview.
  useEffect(() => {
    if (typeof window !== "undefined") setShareUrl(window.location.href);
  }, []);

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
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share product"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "rounded-lg border border-hairline bg-surface p-3 text-ink transition-colors duration-200 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          className
        )}
      >
        <Share2 className="h-6 w-6" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-hairline bg-surface shadow-lg"
        >
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-ink transition-colors hover:bg-surface-muted"
            >
              {l.icon}
              <span>{l.label}</span>
            </a>
          ))}
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
