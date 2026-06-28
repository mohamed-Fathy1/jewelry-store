"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CubeIcon,
  ShoppingBagIcon,
  FolderIcon,
  TruckIcon,
  PhotoIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  TagIcon,
  SwatchIcon,
  Squares2X2Icon,
  SparklesIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { IconButton } from "@/components/admin/ui";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Products", href: "/admin/products", icon: CubeIcon },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBagIcon },
  { name: "Categories", href: "/admin/categories", icon: FolderIcon },
  { name: "Offers", href: "/admin/offers", icon: TagIcon },
  { name: "Colors", href: "/admin/colors", icon: SwatchIcon },
  { name: "Sizes", href: "/admin/sizes", icon: Squares2X2Icon },
  { name: "Icons", href: "/admin/icons", icon: SparklesIcon },
  { name: "Shipping", href: "/admin/shipping", icon: TruckIcon },
  { name: "Hero Section", href: "/admin/hero", icon: PhotoIcon },
  { name: "Promo Video", href: "/admin/video", icon: VideoCameraIcon },
  { name: "Wishlists", href: "/admin/wishlists", icon: HeartIcon },
  { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
  { name: "Backups", href: "/admin/backups", icon: ShieldCheckIcon },
];

function Wordmark() {
  return (
    <Link href="/admin" className="group block rounded-md">
      <span className="block text-2xl font-normal italic leading-none text-admin-heading">
        A&nbsp;to&nbsp;Z
      </span>
      <span className="mt-2 block h-px w-10 bg-admin-gold" aria-hidden="true" />
      <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-admin-ink-muted">
        Admin
      </span>
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLinks = () => (
    <nav className="flex-1 space-y-1 px-3" aria-label="Admin">
      {navigation.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-current={isActive ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-admin-gold bg-admin-surface-muted text-admin-brown"
                : "border-transparent text-admin-ink-muted hover:bg-admin-surface-muted hover:text-admin-ink"
            }`}
          >
            <item.icon
              className={`h-5 w-5 flex-shrink-0 ${
                isActive ? "text-admin-gold" : "text-admin-ink-subtle group-hover:text-admin-brown"
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
      <div className="fixed left-0 top-0 z-50 p-4 md:hidden">
        <IconButton
          label="Open sidebar"
          icon={<Bars3Icon />}
          onClick={() => setIsMobileMenuOpen(true)}
          className="bg-admin-surface shadow-admin-card ring-1 ring-admin-hairline"
        />
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0"
            style={{ backgroundColor: "var(--admin-overlay)" }}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-admin-surface pb-4 pt-6 shadow-admin-popover [overscroll-behavior:contain]">
            <div className="flex items-start justify-between px-5">
              <Wordmark />
              <IconButton
                label="Close sidebar"
                icon={<XMarkIcon />}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            </div>
            <div className="mt-6 flex-1 overflow-y-auto">
              <NavLinks />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex w-64 flex-col">
          <div className="flex h-0 flex-1 flex-col border-r border-admin-hairline bg-admin-surface">
            <div className="flex flex-1 flex-col overflow-y-auto pb-4 pt-6">
              <div className="flex-shrink-0 px-5">
                <Wordmark />
              </div>
              <div className="mt-7 flex-1">
                <NavLinks />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
