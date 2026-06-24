"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBagIcon,
  UserIcon,
  MagnifyingGlassIcon as SearchIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import Search from "./Search";
import NavDrawer from "./NavDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import AnnouncementBar from "./AnnouncementBar";

export default function Header() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { authUser, isAuthenticated, logout } = useAuth();
  const { user } = useUser();
  const { isLoading } = useUser();
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

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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

                {/* Account dropdown */}
                <div className="group relative">
                  <button
                    className="flex items-center rounded-full p-1 text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label={isAuthenticated ? "Account menu" : "Sign in"}
                  >
                    {isAuthenticated ? (
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {authUser?.email?.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <UserIcon className="h-[22px] w-[22px]" />
                    )}
                  </button>

                  <div className="invisible absolute right-0 pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="w-60 overflow-hidden rounded-xl border border-hairline bg-surface shadow-card-hover">
                      <div className="border-b border-hairline bg-surface-muted/60 px-4 py-3">
                        <p className="truncate text-sm font-medium text-ink">
                          {isAuthenticated && Array.isArray(user)
                            ? `Welcome, ${
                                user[0]?.firstName
                                  ? `${user[0]?.firstName} ${user[0]?.lastName}`
                                  : authUser?.email
                              }`
                            : "Welcome"}
                        </p>
                        {!isAuthenticated ? (
                          <p className="mt-0.5 text-xs text-ink-muted">
                            Sign in to track your orders
                          </p>
                        ) : null}
                      </div>

                      <div className="py-1.5">
                        {isAuthenticated ? (
                          <>
                            <DropdownLink
                              href="/account"
                              icon={<UserIcon className="h-4 w-4" />}
                              title="Your Profile"
                              subtitle="Orders & details"
                            />
                            <button
                              onClick={handleLogout}
                              disabled={isLoading}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-muted disabled:opacity-60"
                            >
                              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                              </span>
                              <span>
                                <span className="block text-sm font-medium text-ink">
                                  {isLoading ? "Signing out…" : "Sign out"}
                                </span>
                                <span className="block text-xs text-ink-muted">
                                  Log out of your account
                                </span>
                              </span>
                            </button>
                          </>
                        ) : (
                          <>
                            <DropdownLink
                              href="/auth/login"
                              icon={<UserIcon className="h-4 w-4" />}
                              title="Sign in"
                              subtitle="Access your account"
                            />
                            <DropdownLink
                              href="/auth/register"
                              icon={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
                              title="Create account"
                              subtitle="Join A to Z Accessories"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        )}

        <Search isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </header>

      <NavDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}

function DropdownLink({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="block text-xs text-ink-muted">{subtitle}</span>
      </span>
    </Link>
  );
}
