"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CubeIcon,
  ShoppingBagIcon,
  FolderIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  TruckIcon,
  PhotoIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Products", href: "/admin/products", icon: CubeIcon },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBagIcon },
  { name: "Categories", href: "/admin/categories", icon: FolderIcon },
  // { name: "Customers", href: "/admin/customers", icon: UsersIcon },
  // { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
  // { name: "Settings", href: "/admin/settings", icon: Cog6ToothIcon },
  { name: "Shipping", href: "/admin/shipping", icon: TruckIcon },
  { name: "Hero Section", href: "/admin/hero", icon: PhotoIcon },
  { name: "Wishlists", href: "/admin/wishlists", icon: HeartIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLinks = () => (
    <nav className="flex-1 px-2 space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              isActive
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <item.icon
              className={`mr-3 flex-shrink-0 h-6 w-6 ${
                isActive ? "text-gray-500" : "text-gray-400"
              }`}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 z-50 p-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white">
            <div className="h-full flex flex-col pt-5 pb-4">
              <div className="flex items-center justify-between px-4">
                <Link href="/admin" className="text-2xl font-semibold">
                  Admin Panel
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-5 flex-1 overflow-y-auto">
                <NavLinks />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Link href="/admin" className="text-2xl font-semibold">
                  Admin Panel
                </Link>
              </div>
              <div className="mt-5 flex-1">
                <NavLinks />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
