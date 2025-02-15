"use client";

import { colors } from "@/constants/colors";

export default function ExchangePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <h1
        className="text-2xl md:text-3xl font-semibold mb-6"
        style={{ color: colors.textPrimary }}
      >
        Refunds and Exchanges
      </h1>

      <div
        className="space-y-6 text-base"
        style={{ color: colors.textSecondary }}
      >
        <p>
          You can open your package while the courier is on your door step to
          check it and to make sure of what you ordered.
        </p>

        <p>
          If you didn&apos;t like any of the received products or the products
          are defective or damaged you can send it back with the courier.
        </p>

        <p>
          Returns and Exchanges are only allowed within 24 hours of receiving
          the shipment (fees may be applied according to shipping rates).
        </p>

        <p>
          To be eligible for a refund or exchange, your item must be:
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>In the same condition that you received it</li>
            <li>Unworn or unused</li>
            <li>With tags</li>
            <li>In its original packaging</li>
          </ul>
        </p>

        <p>
          Return or Exchange within 24 hours is only accepted if item(s)
          received were damaged, defective or not the same ordered item.
        </p>

        <p>To start an exchange, contact us on WhatsApp.</p>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: colors.textPrimary }}
          >
            Exceptions / Non-returnable Items
          </h2>
          <p>
            Our products &ldquo;jewelry/ self worn items&rdquo; cannot be
            returned or exchanged except in the first 24 hours of receiving your
            order. Please get in touch if you have questions or concerns about
            your item.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <p className="italic">
            At A TO Z Accessories, We truly appreciate your trust and support.
            Your satisfaction matters to us, and we&apos;re always here to make
            your shopping experience smooth, fair, and filled with care✨💖
          </p>
        </div>
      </div>
    </div>
  );
}
