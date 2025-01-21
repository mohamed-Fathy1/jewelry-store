"use client";

import { useState } from "react";
import { colors } from "@/constants/colors";
import ShippingForm from "@/components/checkout/ShippingForm";
import PaymentForm from "@/components/checkout/PaymentForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";
import ShippingAddressSelector from "@/components/checkout/ShippingAddressSelector";
import { Address } from "@/types/address.types";

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
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = (data: PaymentFormData) => {
    setPaymentData(data);
    setCurrentStep("confirmation");
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    // You can use this address data for your checkout process
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Checkout Progress */}
      <div className="mb-12">
        <div className="flex items-center justify-center space-x-4">
          {["shipping", "payment", "confirmation"].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className="relative flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200"
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
                <span
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-base capitalize"
                  style={{
                    color:
                      currentStep === step
                        ? colors.textPrimary
                        : colors.textSecondary,
                    fontWeight: currentStep === step ? "500" : "normal",
                  }}
                >
                  {step}
                </span>
              </div>
              {index < 2 && (
                <div
                  className="w-24 h-0.5 mx-2"
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
        <div className="invisible flex justify-center mt-2">
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
          {currentStep === "confirmation" && shippingData && (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shipping Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Shipping Information</h2>

          <ShippingAddressSelector
            onAddressSelect={handleAddressSelect}
            selectedAddressId={selectedAddress?._id}
          />
        </div>
      </div>
    </div>
  );
}
