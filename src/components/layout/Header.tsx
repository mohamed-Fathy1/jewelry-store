"use client";

import { useState } from "react";
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

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Collections", href: "/collections" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-sm bg-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
              alt="Luxury Jewelry Store Logo"
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
                className="transition-colors duration-300"
                style={{
                  color:
                    pathname === item.href
                      ? colors.textPrimary
                      : colors.textSecondary,
                }}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Icons */}
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
              className="transition-colors duration-200"
              style={{ color: colors.textSecondary }}
            >
              <ShoppingBagIcon className="h-6 w-6" />
            </Link>
            <Link
              href="/account"
              className="transition-colors duration-200"
              style={{ color: colors.textSecondary }}
            >
              <UserIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden py-4 border-t"
            style={{ borderColor: colors.border }}
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-2 transition-colors duration-200"
                style={{
                  color:
                    pathname === item.href
                      ? colors.textPrimary
                      : colors.textSecondary,
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Search Bar */}
      <Search isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
