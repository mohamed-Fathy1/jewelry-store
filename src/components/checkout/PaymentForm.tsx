"use client";

import { colors } from "@/constants/colors";

interface PaymentFormData {
  paymentMethod: string;
}

interface Props {
  onSubmit: (data: PaymentFormData) => void;
  onBack: () => void;
}

export default function PaymentForm({ onSubmit, onBack }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ paymentMethod: "cod" });
  };

  return (
    <div className="space-y-6">
      <h2
        className="text-2xl font-light mb-6"
        style={{ color: colors.textPrimary }}
      >
        Payment Method
      </h2>

      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              className="text-lg font-medium"
              style={{ color: colors.textPrimary }}
            >
              Cash on Delivery
            </h3>
            <p className="mt-1" style={{ color: colors.textSecondary }}>
              Pay with cash when your order arrives
            </p>
          </div>
          <div
            className="px-3 py-1 rounded-full text-sm"
            style={{
              backgroundColor: colors.brown,
              color: colors.textLight,
            }}
          >
            Recommended
          </div>
        </div>

        <ul className="space-y-2 mb-6" style={{ color: colors.textSecondary }}>
          <li>• No advance payment required</li>
          <li>• Pay only when you receive your items</li>
          <li>• Inspect your items before payment</li>
          <li>• Cash and digital payments accepted on delivery</li>
        </ul>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-md transition-colors duration-200 order-2 sm:order-1"
            style={{
              backgroundColor: colors.background,
              color: colors.textPrimary,
              borderColor: colors.border,
            }}
          >
            Back to Shipping
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 rounded-md transition-colors duration-200 order-1 sm:order-2"
            type="button"
            style={{
              backgroundColor: colors.brown,
              color: colors.textLight,
            }}
          >
            Confirm Order
          </button>
        </div>
      </div>

      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: colors.accentLight }}
      >
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          Note: Our delivery partner will contact you before delivery. Please
          keep your phone handy.
        </p>
      </div>
    </div>
  );
}
