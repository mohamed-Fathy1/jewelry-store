"use client";

import { Marcellus, Hanken_Grotesk } from "next/font/google";
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
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import Script from "next/script";
import { Suspense } from "react";
import AnalyticsRouteTracker from "@/components/analytics/AnalyticsRouteTracker";
import ClarityAnalytics from "@/components/analytics/ClarityAnalytics";
import { GA_MEASUREMENT_ID, META_PIXEL_ID } from "@/lib/analytics";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Inscriptional Roman serif — single weight (400); size carries hierarchy, not bold.
const marcellus = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

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
    <html lang="en" className={`${hanken.variable} ${marcellus.variable}`}>
      <head>
        {/* ── Brand-level social share (Open Graph / Twitter) ──────────────
            Shown when the bare site link (atozaccessory.com) is shared on
            WhatsApp/Facebook/etc. These are STATIC site defaults rendered into
            the SSR'd <head> so crawlers (which don't run JS) can read them.
            Per-product cards come from the backend share endpoint instead, since
            the metadata API can't run while this root layout is a client
            component. */}
        <title>A to Z Accessories</title>
        <meta
          name="description"
          content="تسوّقي أحدث تشكيلات الإكسسوارات والمجوهرات من A to Z Accessories"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="A to Z Accessories" />
        <meta property="og:title" content="A to Z Accessories" />
        <meta
          property="og:description"
          content="تسوّقي أحدث تشكيلات الإكسسوارات والمجوهرات من A to Z Accessories"
        />
        <meta property="og:url" content="https://www.atozaccessory.com" />
        <meta
          property="og:image"
          content="https://www.atozaccessory.com/logo.jpg"
        />
        <meta
          property="og:image:secure_url"
          content="https://www.atozaccessory.com/logo.jpg"
        />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="500" />
        <meta property="og:image:height" content="500" />
        <meta property="og:image:alt" content="A to Z Accessories" />
        <meta property="og:locale" content="ar_EG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="A to Z Accessories" />
        <meta
          name="twitter:description"
          content="تسوّقي أحدث تشكيلات الإكسسوارات والمجوهرات من A to Z Accessories"
        />
        <meta
          name="twitter:image"
          content="https://www.atozaccessory.com/logo.jpg"
        />

        {/* Google Analytics 4 (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
          `}
        </Script>
        {/* End Google Analytics */}

        {/* Meta Pixel Code — single pixel, ID from NEXT_PUBLIC_META_PIXEL_ID.
            Note: init only, NO fbq('track','PageView') here. PageView is fired
            by AnalyticsRouteTracker so it also covers client-side (SPA) route
            changes, with exactly one PageView per navigation. */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className="bg-bg text-ink font-body" suppressHydrationWarning>
        <Suspense fallback={null}>
          <AnalyticsRouteTracker />
        </Suspense>
        {/* Microsoft Clarity — storefront only; skips /admin (see component). */}
        <ClarityAnalytics />
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
