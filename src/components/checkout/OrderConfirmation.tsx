"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface ISelectedAddress {
  _id?: string;
  firstName: string;
  lastName: string;
  apartmentSuite?: string;
  governorate?: string;
  address: string;
  postalCode: string;
  primaryPhone: string;
  secondaryPhone?: string;
  isDefault?: boolean;
}

interface Props {
  selectedAddress: ISelectedAddress;
  shippingData: any;
}

export default function OrderConfirmation({
  selectedAddress,
  shippingData,
}: Props) {
  const streetLine = [selectedAddress.address, selectedAddress.apartmentSuite]
    .filter(Boolean)
    .join(", ");
  const regionLine = [
    shippingData.shipping?.name,
    selectedAddress.governorate,
    selectedAddress.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-md py-2">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent-soft">
          <CheckCircleIcon className="h-9 w-9 text-primary" />
        </div>
        <h2 className="mt-5 font-display text-2xl text-heading">
          Order Confirmed!
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
          Thank you for your order. We&apos;ll send you a confirmation email
          shortly.
        </p>
      </div>

      {/* Details — left-aligned, structured */}
      <dl className="mt-8 overflow-hidden rounded-2xl border border-hairline bg-surface">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ink-subtle">
            Order number
          </dt>
          <dd className="font-medium text-ink tabular-nums">
            #{shippingData._id.slice(-8)}
          </dd>
        </div>

        <div className="border-t border-hairline px-5 py-4">
          <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ink-subtle">
            Shipping address
          </dt>
          <dd className="mt-2 space-y-0.5 text-sm leading-relaxed text-ink">
            <p className="font-medium">
              {selectedAddress.firstName} {selectedAddress.lastName}
            </p>
            {streetLine && <p>{streetLine}</p>}
            {regionLine && <p>{regionLine}</p>}
            {selectedAddress.primaryPhone && (
              <p className="text-ink-muted tabular-nums">
                {selectedAddress.primaryPhone}
              </p>
            )}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-hairline px-5 py-4">
          <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ink-subtle">
            Payment
          </dt>
          <dd className="text-ink">Cash on Delivery</dd>
        </div>
      </dl>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/account/orders/${shippingData._id}`}
          className="flex-1 rounded-full bg-primary px-6 py-3 text-center font-medium text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          Track Order
        </Link>
        <Link
          href="/shop"
          className="flex-1 rounded-full border border-hairline bg-surface px-6 py-3 text-center text-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
