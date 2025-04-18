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
import Script from "next/script";

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
      <head>
        {/* Meta Pixel Code - First Pixel */}
        <Script id="facebook-pixel-1" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1389492105728089');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1389492105728089&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End First Meta Pixel Code */}

        {/* Meta Pixel Code - Second Pixel */}
        <Script id="facebook-pixel-2" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1617903932237399');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1617903932237399&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Second Meta Pixel Code */}
      </head>
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
