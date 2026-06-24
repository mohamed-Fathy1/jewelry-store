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
  // const orderNumber = `ORD${Math.random()
  //   .toString(36)
  //   .substr(2, 9)
  //   .toUpperCase()}`;

  return (
    <div className="text-center space-y-6">
      <CheckCircleIcon className="w-16 h-16 mx-auto text-primary" />
      <div>
        <h2 className="font-display text-2xl mb-2 text-heading">
          Order Confirmed!
        </h2>
        <p className="text-ink-muted">
          Thank you for your order. We&apos;ll send you a confirmation email
          shortly.
        </p>
      </div>

      <div className="p-6 rounded-lg bg-surface-muted">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium uppercase text-ink-muted">
              Order Number
            </h3>
            <p className="text-lg font-medium text-ink tabular-nums">
              #{shippingData._id.slice(-8)}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium uppercase text-ink-muted">
              Shipping Address
            </h3>
            <p className="text-lg text-ink">
              {selectedAddress.firstName} {selectedAddress.lastName}
              <br />
              {selectedAddress.address && selectedAddress.address}
              {selectedAddress.apartmentSuite &&
                `, ${selectedAddress.apartmentSuite}`}
              <br />
              {shippingData.shipping.category}, {selectedAddress.governorate}{" "}
              {selectedAddress.postalCode && `, ${selectedAddress.postalCode}`}
              <br />
              {selectedAddress.primaryPhone}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium uppercase text-ink-muted">
              Payment Method
            </h3>
            <p className="text-lg text-ink">Cash on Delivery</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <Link
          href="/shop"
          className="px-6 py-3 rounded-full border border-hairline bg-surface text-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Continue Shopping
        </Link>
        <Link
          href={`/account/orders/${shippingData._id}`}
          className="px-6 py-3 rounded-full bg-primary text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Track Order
        </Link>
      </div>
    </div>
  );
}
