"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// Microsoft Clarity project id. Kept in code (not env) — it's a public,
// non-secret identifier, same as the site's other analytics ids.
const CLARITY_PROJECT_ID = "xjuc6jvlpy";

/**
 * Microsoft Clarity loader — STOREFRONT ONLY (heatmaps + session replay).
 *
 * We deliberately skip the /admin panel: recording internal staff managing
 * products/orders would pollute the heatmaps and recordings with behaviour that
 * has nothing to do with the shopping experience, and there's no reason to
 * record the team's own sessions (privacy).
 *
 * Gating by pathname means a session that STARTS on /admin never loads the
 * Clarity tag at all — admins reach the panel directly (login redirect /
 * bookmark), so their sessions stay out, while customers effectively never
 * visit /admin. The Clarity script body itself is verbatim from Clarity; it's
 * wrapped in next/script (like GA/Meta) because it renders inside JSX.
 */
export default function ClarityAnalytics() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
      `}
    </Script>
  );
}
