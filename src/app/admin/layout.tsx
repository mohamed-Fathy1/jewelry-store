"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  // One QueryClient per mounted admin session. Created lazily so it survives
  // re-renders without being recreated.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    if (isLoading || isLoginPage) return;
    if (!isAdmin(authUser)) {
      router.push("/admin/login");
    }
  }, [authUser, isLoading, isLoginPage, router]);

  // The login page is public and renders without the admin chrome/guard.
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin(authUser)) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-6 py-8">{children}</div>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
