"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { colors } from "@/constants/colors";

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
      <CheckCircleIcon
        className="w-16 h-16 mx-auto"
        style={{ color: colors.brown }}
      />
      <div>
        <h2
          className="text-2xl font-light mb-2"
          style={{ color: colors.textPrimary }}
        >
          Order Confirmed!
        </h2>
        <p style={{ color: colors.textSecondary }}>
          Thank you for your order. We&apos;ll send you a confirmation email
          shortly.
        </p>
      </div>

      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: colors.background }}
      >
        <div className="space-y-4">
          <div>
            <h3
              className="text-sm font-medium uppercase"
              style={{ color: colors.textSecondary }}
            >
              Order Number
            </h3>
            <p
              className="text-lg font-medium"
              style={{ color: colors.textPrimary }}
            >
              #{shippingData._id.slice(-8)}
            </p>
          </div>

          <div>
            <h3
              className="text-sm font-medium uppercase"
              style={{ color: colors.textSecondary }}
            >
              Shipping Address
            </h3>
            <p className="text-lg" style={{ color: colors.textPrimary }}>
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
            <h3
              className="text-sm font-medium uppercase"
              style={{ color: colors.textSecondary }}
            >
              Payment Method
            </h3>
            <p className="text-lg" style={{ color: colors.textPrimary }}>
              Cash on Delivery
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <Link
          href="/shop"
          className="px-6 py-3 rounded-md transition-colors duration-200"
          style={{
            backgroundColor: colors.background,
            color: colors.textPrimary,
          }}
        >
          Continue Shopping
        </Link>
        <Link
          href={`/account/orders/${shippingData._id}`}
          className="px-6 py-3 rounded-md transition-colors duration-200"
          style={{
            backgroundColor: colors.brown,
            color: colors.textLight,
          }}
        >
          Track Order
        </Link>
      </div>
    </div>
  );
}
