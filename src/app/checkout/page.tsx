"use client";

import { useState } from "react";
import { colors } from "@/constants/colors";
import ShippingForm from "@/components/checkout/ShippingForm";
import PaymentForm from "@/components/checkout/PaymentForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";

interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentFormData {
  paymentMethod: string;
}

type CheckoutStep = "shipping" | "payment" | "confirmation";

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(
    null
  );
  const [paymentData, setPaymentData] = useState(null);

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = (data: PaymentFormData) => {
    setPaymentData(data);
    setCurrentStep("confirmation");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Checkout Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {["shipping", "payment", "confirmation"].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200"
                style={{
                  backgroundColor:
                    currentStep === step
                      ? colors.brown
                      : index <
                        ["shipping", "payment", "confirmation"].indexOf(
                          currentStep
                        )
                      ? colors.gold
                      : colors.background,
                  color:
                    currentStep === step ||
                    index <
                      ["shipping", "payment", "confirmation"].indexOf(
                        currentStep
                      )
                      ? colors.textLight
                      : colors.textSecondary,
                  borderColor: colors.border,
                }}
              >
                {index + 1}
              </div>
              {index < 2 && (
                <div
                  className="w-24 h-1 mx-2"
                  style={{
                    backgroundColor:
                      index <
                      ["shipping", "payment", "confirmation"].indexOf(
                        currentStep
                      )
                        ? colors.gold
                        : colors.border,
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2 space-x-16">
          <span
            style={{
              color:
                currentStep === "shipping"
                  ? colors.textPrimary
                  : colors.textSecondary,
            }}
          >
            Shipping
          </span>
          <span
            style={{
              color:
                currentStep === "payment"
                  ? colors.textPrimary
                  : colors.textSecondary,
            }}
          >
            Payment
          </span>
          <span
            style={{
              color:
                currentStep === "confirmation"
                  ? colors.textPrimary
                  : colors.textSecondary,
            }}
          >
            Confirmation
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Forms */}
        <div className="lg:col-span-8">
          {currentStep === "shipping" && (
            <ShippingForm onSubmit={handleShippingSubmit} />
          )}
          {currentStep === "payment" && (
            <PaymentForm
              onSubmit={handlePaymentSubmit}
              onBack={() => setCurrentStep("shipping")}
            />
          )}
          {currentStep === "confirmation" && (
            <OrderConfirmation
              shippingData={shippingData}
              paymentData={paymentData}
            />
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
