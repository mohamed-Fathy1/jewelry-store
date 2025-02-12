"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { CategoryProvider } from "@/contexts/CategoryContext";
import { CartProvider } from "@/contexts/CartContext";
import { useEffect } from "react";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import CheckoutPage from "./checkout/page";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { colors } from "@/constants/colors";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Suppress hydration warnings
    const originalError = console.error;
    console.error = (...args) => {
      if (/Warning.*Content.*match/.test(args[0])) return;
      originalError.call(console, ...args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <html lang="en">
      <body
        className={inter.className}
        style={{ backgroundColor: colors.background }}
        suppressHydrationWarning
      >
        <AuthProvider>
          <UserProvider>
            <CategoryProvider>
              <ProductProvider>
                <CartProvider>
                  <CheckoutProvider>
                    <WishlistProvider>
                      <LayoutWrapper>{children}</LayoutWrapper>
                    </WishlistProvider>
                  </CheckoutProvider>
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
