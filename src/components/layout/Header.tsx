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
              className="transition-colors duration-200"
              style={{ color: colors.textSecondary }}
            >
              <ShoppingBagIcon className="h-6 w-6" />
            </Link>

            {/* Improved Auth Dropdown */}
            <div className="relative group">
              <button
                className="p-2 rounded-full transition-all duration-200 hover:bg-gray-100 hover:scale-105"
                style={{ color: colors.textSecondary }}
              >
                <UserIcon className="h-6 w-6" />
              </button>

              {/* Added padding-top to create hovering space */}
              <div className="absolute right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
                {/* Dropdown Menu */}
                <div
                  className="w-56 rounded-lg overflow-hidden transform transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {/* User Section */}
                  <div
                    className="px-4 py-3 border-b transition-colors duration-200"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: `${colors.brown}08`,
                    }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.textPrimary }}
                    >
                      Welcome to LUXE
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
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
                  </div>
                </div>
              </div>
            </div>
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
