"use client";

import { Button } from "@/components/ui/Button";

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
      <h2 className="font-display text-2xl mb-6 text-heading">
        Payment Method
      </h2>

      <div className="p-6 rounded-lg border border-hairline bg-surface">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-ink">Cash on Delivery</h3>
            <p className="mt-1 text-ink-muted">
              Pay with cash when your order arrives
            </p>
          </div>
          <div className="px-3 py-1 rounded-full text-sm bg-primary text-on-primary">
            Recommended
          </div>
        </div>

        <ul className="space-y-2 mb-6 text-ink-muted">
          <li>• No advance payment required</li>
          <li>• Pay only when you receive your items</li>
          <li>• Inspect your items before payment</li>
          <li>• Cash and digital payments accepted on delivery</li>
        </ul>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onBack}
            className="order-2 sm:order-1"
          >
            Back to Shipping
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleSubmit}
            className="order-1 flex-1 sm:order-2"
          >
            Confirm Order
          </Button>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-accent-soft">
        <p className="text-sm text-ink-muted">
          Note: Our delivery partner will contact you before delivery. Please
          keep your phone handy.
        </p>
      </div>
    </div>
  );
}
