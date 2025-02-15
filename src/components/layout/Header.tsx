"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShoppingBagIcon,
  UserIcon,
  MagnifyingGlassIcon as SearchIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { colors } from "@/constants/colors";
import Search from "./Search";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import PromoBanner from "./PromoBanner";
import { useRouter } from "next/navigation";

const StarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 1.89l2.75 6.6 7.25.79-5.5 4.83 1.65 7-6.15-3.79-6.15 3.79 1.65-7-5.5-4.83 7.25-.79z" />
  </svg>
);

export default function Header() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { authUser, isAuthenticated, logout } = useAuth();
  const { user } = useUser();
  const { isLoading } = useUser();
  const { cart } = useCart();
  const [isClient, setIsClient] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuToggleRef = useRef<HTMLButtonElement>(null);

  const [lastScrollY, setLastScrollY] = useState(0);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node) &&
      mobileMenuToggleRef.current &&
      !mobileMenuToggleRef.current.contains(event.target as Node)
    ) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleScroll = (e) => {
    const scrollThreshold = 150;
    const currentScrollY = window.scrollY;

    // Only close the menu if it's open AND we're actively scrolling past the threshold
    if (isMobileMenuOpen && currentScrollY > lastScrollY + scrollThreshold) {
      setIsMobileMenuOpen(false);
    }
    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    setIsClient(true);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobileMenuOpen]);

  const isFeaturedCategoriesInPath =
    window.location.hash === "#featured-categories";

  useEffect(() => {
    // Only run this effect when we're on the home page
    console.log(isFeaturedCategoriesInPath);
    if (pathname === "/" && isFeaturedCategoriesInPath) {
      const navbarHeight = 64; // Adjust this value based on your navbar height
      const section = document.getElementById("featured-categories");
      if (section) {
        const top =
          section.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  }, [pathname, isLoading]);

  const handleScrollToFeaturedCategories = (event: React.MouseEvent) => {
    event.preventDefault();
    const section = document.getElementById("featured-categories");
    const navbarHeight = 64; // Adjust this value based on your navbar height

    if (pathname !== "/") {
      // If not on the home page, redirect to home
      router.push("/#featured-categories");
    } else if (section) {
      // If already on the home page, just scroll
      const top =
        section.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Check if the hash is present in the URL

  // Update the navigation array
  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    {
      name: "Sale",
      href: "/shop?sale=true",
      isSpecial: true,
    },
    {
      name: "Categories",
      href: "/#featured-categories",
      onClick: handleScrollToFeaturedCategories,
    },
    { name: "About Us", href: "/about" },
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <PromoBanner />
      <header className="sticky top-0 z-50 shadow-sm bg-white">
        {/* Render only if on the client */}
        {isClient && (
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              {/* Mobile menu button */}
              <button
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                style={{ color: colors.textPrimary }}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>

              {/* Logo */}
              <Link href="/" className="text-2xl font-semibold">
                <Image
                  src="/logo.jpg"
                  alt="Atozaccessories Jewelry Store"
                  width={60}
                  height={60}
                  className="h-8 w-auto"
                />
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={item.onClick}
                    className={`transition-colors duration-300 ${
                      item.isSpecial ? "relative group flex items-center" : ""
                    }`}
                    style={{
                      color: item.isSpecial
                        ? `${colors.gold}dd`
                        : pathname === item.href
                        ? colors.textPrimary
                        : colors.textSecondary,
                    }}
                  >
                    {item.isSpecial && (
                      <StarIcon className="w-3 h-3 absolute -left-1 -top-1 transition-opacity duration-300" />
                    )}
                    {item.name}
                    {item.isSpecial && (
                      <>
                        <StarIcon className="w-3 h-3 absolute -right-1 -bottom-1 transition-opacity duration-300" />
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-30 animate-shine-slow" />
                        <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                        <style jsx>{`
                          @keyframes shine {
                            from {
                              transform: translateX(-100%);
                            }
                            to {
                              transform: translateX(100%);
                            }
                          }
                          .animate-shine-slow {
                            animation: shine 3s infinite linear;
                          }
                        `}</style>
                      </>
                    )}
                  </Link>
                ))}
              </div>

              {/* Icons - Updated with auth links */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="transition-colors duration-200"
                  style={{ color: colors.textSecondary }}
                >
                  <SearchIcon className="h-6 w-6" />
                </button>
                <Link
                  href="/cart"
                  className="relative transition-colors duration-200"
                  style={{ color: colors.textSecondary }}
                >
                  <ShoppingBagIcon className="h-6 w-6" />
                  {cart.items.length > 0 && (
                    <span
                      className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs rounded-full"
                      style={{
                        backgroundColor: colors.brown,
                        color: colors.textLight,
                      }}
                    >
                      {cart.items.length}
                    </span>
                  )}
                </Link>

                {/* Improved Auth Dropdown */}
                <div className="relative group">
                  <button
                    className="p-2 rounded-full transition-all duration-200 hover:bg-gray-100 hover:scale-105"
                    style={{ color: colors.textSecondary }}
                    ref={mobileMenuToggleRef}
                  >
                    {isAuthenticated ? (
                      <div
                        className="h-6 w-6 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: `${colors.brown}15`,
                          color: colors.brown,
                        }}
                      >
                        <span className="text-sm font-medium">
                          {authUser?.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <UserIcon className="h-6 w-6" />
                    )}
                  </button>

                  <div className="absolute right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
                    <div
                      className="w-56 rounded-lg overflow-hidden transform transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <div
                        className="px-4 py-3 border-b transition-colors duration-200"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: `${colors.brown}08`,
                        }}
                      >
                        <p
                          className="text-sm font-medium capitalize text-ellipsis whitespace-nowrap w-full overflow-clip"
                          style={{ color: colors.textPrimary }}
                        >
                          {isAuthenticated && Array.isArray(user)
                            ? `Welcome, ${
                                user[0]?.firstName
                                  ? user[0]?.firstName + " " + user[0]?.lastName
                                  : authUser?.email
                              }`
                            : "Welcome to atozaccessory"}
                        </p>
                      </div>

                      <div className="py-1">
                        {isAuthenticated ? (
                          <>
                            <Link
                              href="/account"
                              className="flex items-center px-4 py-3 transition-all duration-200 hover:translate-x-1 hover:bg-brown hover:bg-opacity-10"
                              style={{ color: colors.textPrimary }}
                            >
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                                style={{
                                  backgroundColor: `${colors.brown}15`,
                                  color: colors.brown,
                                }}
                              >
                                <UserIcon className="h-5 w-5" />
                              </span>
                              <div>
                                <p className="text-sm font-medium">
                                  Your Profile
                                </p>
                                <p
                                  className="text-xs"
                                  style={{ color: colors.textSecondary }}
                                >
                                  View your profile
                                </p>
                              </div>
                            </Link>

                            <button
                              onClick={handleLogout}
                              disabled={isLoading}
                              className="w-full flex items-center px-4 py-3 transition-all duration-200 hover:translate-x-1 hover:bg-brown hover:bg-opacity-10"
                              style={{ color: colors.textPrimary }}
                            >
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                                style={{
                                  backgroundColor: `${colors.brown}15`,
                                  color: colors.brown,
                                }}
                              >
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                  />
                                </svg>
                              </span>
                              <div>
                                <p className="text-sm font-medium text-left">
                                  {isLoading ? "Signing out..." : "Sign out"}
                                </p>
                                <p
                                  className="text-xs"
                                  style={{ color: colors.textSecondary }}
                                >
                                  Log out of your account
                                </p>
                              </div>
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              href="/auth/register"
                              className="flex items-center px-4 py-3 transition-all duration-200 hover:translate-x-1 hover:bg-brown hover:bg-opacity-10 hover:text-white"
                              style={{
                                color: colors.textPrimary,
                              }}
                            >
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-all duration-200 group-hover:scale-110"
                                style={{
                                  backgroundColor: `${colors.brown}15`,
                                  color: colors.brown,
                                }}
                              >
                                <UserIcon className="h-5 w-5" />
                              </span>
                              <div>
                                <p className="text-sm font-medium">Register</p>
                                <p
                                  className="text-xs"
                                  style={{ color: colors.textSecondary }}
                                >
                                  Create a new account
                                </p>
                              </div>
                            </Link>

                            <Link
                              href="/auth/login"
                              className="flex items-center px-4 py-3 transition-all duration-200 bg-transparent hover:translate-x-1 hover:bg-brown hover:bg-opacity-10"
                              style={{
                                color: colors.textPrimary,
                              }}
                            >
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-all duration-200 group-hover:scale-110"
                                style={{
                                  backgroundColor: `${colors.brown}15`,
                                  color: colors.brown,
                                }}
                              >
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                  />
                                </svg>
                              </span>
                              <div>
                                <p className="text-sm font-medium">Login</p>
                                <p
                                  className="text-xs"
                                  style={{ color: colors.textSecondary }}
                                >
                                  Access your account
                                </p>
                              </div>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div
                ref={mobileMenuRef}
                className="md:hidden z-50 absolute left-0 top-full w-full py-4 px-4 border-y"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                }}
              >
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block transition-colors py-2 duration-200 ${
                      item.isSpecial
                        ? "relative group overflow-hidden flex items-center"
                        : ""
                    }`}
                    style={{
                      color: item.isSpecial
                        ? `${colors.gold}dd`
                        : pathname === item.href
                        ? colors.textPrimary
                        : colors.textSecondary,
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.isSpecial && (
                      <StarIcon className="w-3 h-3 mr-1 animate-twinkle" />
                    )}
                    {item.name}
                    {item.isSpecial && (
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </nav>
        )}

        {/* Search Bar */}
        <Search isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </header>
    </>
  );
}
