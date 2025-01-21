"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { CategoryProvider } from "@/contexts/CategoryContext";
import { CartProvider } from "@/contexts/CartContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <UserProvider>
            <CategoryProvider>
              <ProductProvider>
                <CartProvider>
                  <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-grow">{children}</main>
                    <Footer />
                  </div>
                </CartProvider>
              </ProductProvider>
            </CategoryProvider>
          </UserProvider>
        </AuthProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
