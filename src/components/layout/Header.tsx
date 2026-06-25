"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBagIcon,
  UserIcon,
  MagnifyingGlassIcon as SearchIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import Search from "./Search";
import NavDrawer from "./NavDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import AnnouncementBar from "./AnnouncementBar";

export default function Header() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { authUser, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleScrollToFeaturedCategories = (event: React.MouseEvent) => {
    event.preventDefault();
    const section = document.getElementById("featured-categories");
    const navbarHeight = 64;
    if (pathname !== "/") {
      router.push("/#featured-categories");
    } else if (section) {
      const top =
        section.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Sale", href: "/shop?sale=true", isSpecial: true },
    {
      name: "Categories",
      href: "/#featured-categories",
      onClick: handleScrollToFeaturedCategories,
    },
    { name: "About", href: "/about" },
    { name: "Exchange Policy", href: "/exchange-policy" },
  ];

  const navLinkClass = (item: (typeof navigation)[number]) =>
    cn(
      "group relative rounded-sm text-[13px] tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
      item.isSpecial
        ? "text-accent hover:text-primary"
        : pathname === item.href
        ? "text-ink"
        : "text-ink-muted hover:text-ink"
    );

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-hairline bg-surface/85 backdrop-blur-md">
        {isClient && (
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Left: menu + logo */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  className="-ml-1.5 inline-flex items-center gap-2 rounded-full p-1.5 text-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  onClick={() => setIsMenuOpen(true)}
                  aria-label="Open menu"
                  aria-expanded={isMenuOpen}
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>

                <Link
                  href="/"
                  aria-label="A to Z Accessories — home"
                  className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span className="font-display text-xl tracking-wide text-heading">
                    A to Z
                  </span>
                </Link>
              </div>

              {/* Center: desktop nav */}
              <div className="hidden md:flex md:gap-9">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={item.onClick}
                    className={navLinkClass(item)}
                  >
                    {item.name}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute -bottom-1.5 left-0 h-px w-full origin-left bg-current transition-transform duration-300",
                        pathname === item.href
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      )}
                    />
                  </Link>
                ))}
              </div>

              {/* Right: icons */}
              <div className="flex items-center gap-1.5 sm:gap-3">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="rounded-full p-1.5 text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Search products"
                  aria-expanded={isSearchOpen}
                >
                  <SearchIcon className="h-[22px] w-[22px]" />
                </button>
                <Link
                  href="/cart"
                  className="relative rounded-full p-1.5 text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={`Cart, ${cart.items.length} ${
                    cart.items.length === 1 ? "item" : "items"
                  }`}
                >
                  <ShoppingBagIcon className="h-[22px] w-[22px]" />
                  {cart.items.length > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-medium tabular-nums text-on-primary">
                      {cart.items.length}
                    </span>
                  )}
                </Link>

                {/* Avatar links straight to the profile (or sign-in when
                    logged out). Logout now lives in the side menu. */}
                <Link
                  href={isAuthenticated ? "/account" : "/auth/login"}
                  className="flex items-center rounded-full p-1 text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={isAuthenticated ? "Your profile" : "Sign in"}
                >
                  {isAuthenticated ? (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {authUser?.email?.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <UserIcon className="h-[22px] w-[22px]" />
                  )}
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Rendered OUTSIDE <header>: the header's `backdrop-blur` makes it a
          containing block for fixed descendants, which would clip the overlay's
          `fixed inset-0` scrim to the header band instead of the full viewport. */}
      <Search isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <NavDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
