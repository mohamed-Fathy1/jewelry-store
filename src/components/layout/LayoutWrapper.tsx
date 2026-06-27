"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith("/admin");

  // Flex column pinned to the viewport so the footer never floats mid-page on
  // short routes (e.g. the empty cart) — the <main> grows to fill the gap.
  return (
    <div className="flex min-h-dvh flex-col">
      {!isAdminPath && <Header />}
      <main className="flex-1">{children}</main>
      {!isAdminPath && <Footer />}
    </div>
  );
}
