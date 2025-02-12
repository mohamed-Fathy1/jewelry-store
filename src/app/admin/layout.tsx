"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin } from "@/utils/auth.utils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

const navigation = [
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingBagIcon,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin(authUser)) {
      router.push(
        "/auth/login?message=Unauthorized access. Please login as admin."
      );
    }
  }, [authUser, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin(authUser)) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
