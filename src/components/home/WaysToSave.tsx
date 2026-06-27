"use client";

import { useEffect, useState } from "react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { offersService } from "@/services/offers.service";
import { Offer } from "@/types/offer.types";
import { promoIcons } from "@/lib/promoIcons";

function iconForOffer(type: string): string {
  if (type.includes("free_shipping")) return promoIcons.freeShipping;
  if (type.includes("half_price") || type.includes("discount"))
    return promoIcons.sale;
  if (type.includes("free_item") || type.includes("cheapest_free"))
    return promoIcons.holiday;
  return promoIcons.bestSeller;
}

export default function WaysToSave() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await offersService.getActiveOffers(6);
        if (active) {
          // Flash sale has its own band; show the cart incentives here.
          setOffers(list.filter((o) => o.offerType !== "flash_sale"));
        }
      } catch {
        /* silent — section just hides */
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!isLoading && offers.length === 0) return null;

  const items = offers.slice(0, 4);

  return (
    <Section surface="muted">
      <SectionHeading
        title="Ways to save"
        description="Live offers, applied automatically at checkout — no codes to remember."
        align="center"
      />

      {isLoading ? (
        <div className="grid gap-y-10 border-y border-hairline py-12 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-surface-sunken" />
          ))}
        </div>
      ) : (
        <ul className="grid gap-y-12 border-y border-hairline py-12 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
          {items.map((offer) => (
            <li
              key={offer._id}
              className="flex flex-col items-center px-4 text-center"
            >
              <span
                aria-hidden="true"
                className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-surface text-heading ring-1 ring-hairline [&_svg]:h-7 [&_svg]:w-7"
                dangerouslySetInnerHTML={{
                  __html: iconForOffer(offer.offerType),
                }}
              />
              <h3
                dir="auto"
                className="font-display text-lg leading-snug text-heading"
              >
                {offer.title}
              </h3>
              {offer.description ? (
                <p
                  dir="auto"
                  className="mt-2 max-w-[28ch] text-sm leading-relaxed text-ink-muted"
                >
                  {offer.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
