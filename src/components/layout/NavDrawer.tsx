"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { XMarkIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useCategory } from "@/contexts/CategoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { iconForCategory } from "@/lib/categoryIcons";
import { promoIcons, type PromoIconKey } from "@/lib/promoIcons";
import { Category } from "@/types/category.types";

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const HIGHLIGHTS: {
  key: PromoIconKey;
  label: string;
  sub: string;
  href: string;
}[] = [
  { key: "bestSeller", label: "Best Sellers", sub: "Most loved", href: "/shop" },
  { key: "sale", label: "On Sale", sub: "Limited time", href: "/shop?sale=true" },
  { key: "newIn", label: "New In", sub: "Just arrived", href: "/shop" },
  { key: "holiday", label: "Gifting", sub: "Ready to give", href: "/shop" },
];

const PAGES = [
  { name: "Home", href: "/" },
  { name: "Shop all", href: "/shop" },
  { name: "About us", href: "/about" },
  { name: "Exchange policy", href: "/exchange-policy" },
];

function Svg({ markup, className }: { markup: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: markup }} />;
}

export default function NavDrawer({ isOpen, onClose }: NavDrawerProps) {
  const { categories, getAllCategories } = useCategory();
  const { isAuthenticated } = useAuth();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (isOpen) getAllCategories();
  }, [isOpen, getAllCategories]);

  // Escape to close + lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-y-0 left-0 z-[71] flex w-full max-w-[27rem] flex-col bg-surface shadow-card-hover"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "tween",
              duration: reduce ? 0 : 0.42,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
              <span className="font-display text-xl text-heading">
                A to Z Accessories
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">
              {/* Free-shipping banner — the recolored brand stamp */}
              <div className="flex items-center gap-4 rounded-2xl bg-surface-muted px-4 py-3.5 ring-1 ring-hairline">
                <Svg
                  markup={promoIcons.freeShipping}
                  className="shrink-0 [&_svg]:h-10 [&_svg]:w-10"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">
                    Complimentary shipping
                  </p>
                  <p className="text-xs text-ink-muted">
                    On orders delivered across Egypt
                  </p>
                </div>
              </div>

              {/* Highlights */}
              <div className="mt-7 grid grid-cols-2 gap-3">
                {HIGHLIGHTS.map((h) => (
                  <Link
                    key={h.key}
                    href={h.href}
                    onClick={onClose}
                    className="group flex flex-col gap-3 rounded-2xl border border-hairline bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Svg
                      markup={promoIcons[h.key]}
                      className="text-heading transition-colors group-hover:text-primary [&_svg]:h-7 [&_svg]:w-7"
                    />
                    <span>
                      <span className="block text-sm font-medium text-ink">
                        {h.label}
                      </span>
                      <span className="block text-xs text-ink-muted">
                        {h.sub}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>

              {/* Categories */}
              <div className="mt-8">
                <p className="mb-3 text-xs uppercase tracking-[0.18em] text-ink-subtle">
                  Shop by category
                </p>
                <ul className="-mx-2">
                  {categories?.map((category: Category) => {
                    const icon =
                      category.icon_id?.svg ||
                      iconForCategory(category.categoryName);
                    return (
                      <li key={category._id}>
                        <Link
                          href={`/shop?categoryId=${category._id}`}
                          onClick={onClose}
                          className="group flex items-center gap-3.5 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:bg-surface-muted"
                        >
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-muted text-heading ring-1 ring-hairline transition-colors group-hover:bg-accent-soft group-hover:ring-accent [&_svg]:h-5 [&_svg]:w-5">
                            {icon ? (
                              <Svg markup={icon} />
                            ) : (
                              <span className="font-display text-base">
                                {category.categoryName?.trim()?.charAt(0)}
                              </span>
                            )}
                          </span>
                          <span className="flex-1 truncate text-[15px] text-ink transition-colors group-hover:text-heading">
                            {category.categoryName}
                          </span>
                          <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-subtle transition-colors group-hover:text-accent" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Pages */}
              <div className="mt-8 border-t border-hairline pt-6">
                <ul className="space-y-0.5">
                  {PAGES.map((p) => (
                    <li key={p.name}>
                      <Link
                        href={p.href}
                        onClick={onClose}
                        className="block rounded-lg px-2 py-2 text-[15px] text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:bg-surface-muted"
                      >
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-hairline px-6 py-5">
              <Link
                href={isAuthenticated ? "/account" : "/auth/login"}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
              >
                {isAuthenticated ? "Your account" : "Sign in"}
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
              <div className="flex gap-2">
                <a
                  href="https://www.instagram.com/a.to.zaccessories"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-hairline text-ink-muted transition-colors hover:text-primary hover:ring-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <FaInstagram className="h-[18px] w-[18px]" />
                </a>
                <a
                  href="https://wa.me/201044698713"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-hairline text-ink-muted transition-colors hover:text-primary hover:ring-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <FaWhatsapp className="h-[18px] w-[18px]" />
                </a>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
