"use client";

import { useState, useEffect } from "react";
import { colors } from "@/constants/colors";
import ShippingForm from "@/components/checkout/ShippingForm";
import PaymentForm from "@/components/checkout/PaymentForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";
import ShippingAddressSelector from "@/components/checkout/ShippingAddressSelector";
import { Address } from "@/types/address.types";
import CheckoutShipping from "@/components/checkout/CheckoutShipping";
import { useCheckout } from "@/contexts/CheckoutContext";
import { createOrder, orderService } from "@/services/order.service";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

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
  const {
    shippingData,
    setShippingData,
    paymentData,
    setPaymentData,
    selectedAddress,
    setSelectedAddress,
    selectedShipping,
  } = useCheckout();
  const { cart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [loading, setLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = async (data: PaymentFormData) => {
    setPaymentData(data);
    setLoading(true);
    console.log(selectedAddress);
    console.log(cart);

    // Prepare order data
    const orderData = {
      userId: selectedAddress._id,
      shippingId: selectedShipping._id,
      products: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      const result = await orderService.createOrder(orderData);
      if (result.success) {
        setOrderMessage(result.message);
        setCurrentStep("confirmation");
      } else {
        setOrderMessage("Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setOrderMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const handleAddressSelect = (address: Address) => {
  //   setSelectedAddress(address);
  // };

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
      <div className="relative h-fit overflow-visible grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Forms */}
        <div className="lg:col-span-8">
          {currentStep === "shipping" && (
            <div className="container mx-auto py-8">
              <CheckoutShipping onSubmit={handleShippingSubmit} />
            </div>
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
        <div className="sticky top-0 lg:col-span-4 z-10 h-full">
          <OrderSummary />
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="text-white">Processing your order...</div>
        </div>
      )}

      {orderMessage && (
        <div className="mt-4 text-center text-lg text-green-600">
          {orderMessage}
        </div>
      )}
    </div>
  );
}
