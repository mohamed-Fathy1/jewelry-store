"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBagIcon,
  UserIcon,
  MagnifyingGlassIcon as SearchIcon,
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Collections", href: "/collections" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-semibold text-gray-900">
            <Image
              src="logo.jpg"
              alt="Luxury Jewelry Store Logo"
              width={60}
              height={60}
              className="h-8 w-auto"
            />
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  pathname === item.href
                    ? "text-black"
                    : "text-gray-500 hover:text-gray-900"
                } transition-colors duration-300`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-500 hover:text-gray-900"
            >
              <SearchIcon className="h-6 w-6" />
            </button>
            <Link href="/cart" className="text-gray-500 hover:text-gray-900">
              <ShoppingBagIcon className="h-6 w-6" />
            </Link>
            <Link href="/account" className="text-gray-500 hover:text-gray-900">
              <UserIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
          <input
            type="text"
            placeholder="Search for jewelry..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      )}
    </header>
  );
}
