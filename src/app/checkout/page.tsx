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
import { orderService } from "@/services/order.service";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner"; // Import the new loading component
import { useRouter } from "next/navigation";

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
  const calculateCartTotal = (cartItems, includeShipping = true) => {
    // Calculate items subtotal
    const subtotal = cartItems.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);

    // Calculate discount (10% for orders over 1500 EGP)
    let discount = subtotal >= 1500 ? subtotal * 0.1 : 0;

    // Check if eligible for free shipping
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const isEligibleForFreeShipping = totalItems >= 3 || subtotal >= 1500;

    // Calculate shipping cost
    let shippingCost = 0;
    if (includeShipping && selectedShipping && !isEligibleForFreeShipping) {
      shippingCost = selectedShipping.cost || 0;
    }

    const total = subtotal - discount + shippingCost;
    return total;
  };

  const {
    shippingData,
    setShippingData,
    paymentData,
    setPaymentData,
    selectedAddress,
    setSelectedAddress,
    selectedShipping,
  } = useCheckout();
  const { cart, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [loading, setLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [orderSummaryPreview, setOrderSummaryPreview] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    // Track initial checkout step
    if (typeof window !== "undefined" && (window as any).fbq) {
      const subtotal = cart.items.reduce(
        (total, item) => total + (item.price || 0) * item.quantity,
        0
      );
      const totalItems = cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const isEligibleForFreeShipping = totalItems >= 3 || subtotal >= 1500;
      const discount = subtotal >= 1500 ? subtotal * 0.1 : 0;

      (window as any).fbq("track", "InitiateCheckout", {
        content_name: "Checkout Start",
        content_category: "Checkout",
        currency: "EGP",
        num_items: totalItems,
        value: subtotal - discount,
        subtotal: subtotal,
        discount_value: discount,
        checkout_step: 1,
        contents: cart.items.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
          price: item.price || 0,
        })),
      });
    }
  }, []);

  useEffect(() => {
    console.log(cart);
    if (!cart.items.length && !orderSummaryPreview?.items.length && isClient) {
      router.push("/");
    } else if (cart.items.length && isClient) {
      // Track cart view with contents
      const cartTotal = calculateCartTotal(cart.items);
      if (typeof window !== "undefined" && (window as any).fbq) {
        const subtotal = cart.items.reduce(
          (total, item) => total + (item.price || 0) * item.quantity,
          0
        );
        const totalItems = cart.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const isEligibleForFreeShipping = totalItems >= 3 || subtotal >= 1500;
        const discount = subtotal >= 1500 ? subtotal * 0.1 : 0;
        const shippingCost =
          selectedShipping && !isEligibleForFreeShipping
            ? selectedShipping.cost
            : 0;
        const finalTotal = subtotal - discount + shippingCost;

        (window as any).fbq("track", "ViewCart", {
          content_type: "product",
          contents: cart.items.map((item) => ({
            id: item.productId,
            quantity: item.quantity,
            price: item.price || 0,
          })),
          currency: "EGP",
          value: finalTotal,
          subtotal: subtotal,
          discount_value: discount,
          shipping_cost: shippingCost,
          shipping_method: selectedShipping?.category || "standard",
          has_free_shipping: isEligibleForFreeShipping,
          discount_code: subtotal >= 1500 ? "10_PERCENT_OFF" : null,
          num_items: totalItems,
        });
      }
    }
  }, [cart.items, isClient]);

  useEffect(() => {
    if (cart.items.length) {
      setOrderSummaryPreview(cart);
    }
  }, [currentStep]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const handleShippingSubmit = (data: ShippingFormData) => {
    if (!selectedShipping) {
      toast.error("please select a shpping method");
      return;
    }
    if (!selectedAddress) {
      toast.error("please select a shpping address");
      return;
    }
    // Track shipping step completion
    if (typeof window !== "undefined" && (window as any).fbq) {
      const subtotal = cart.items.reduce(
        (total, item) => total + (item.price || 0) * item.quantity,
        0
      );
      const totalItems = cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const isEligibleForFreeShipping = totalItems >= 3 || subtotal >= 1500;
      const discount = subtotal >= 1500 ? subtotal * 0.1 : 0;
      const shippingCost =
        selectedShipping && !isEligibleForFreeShipping
          ? selectedShipping.cost
          : 0;

      // Track AddShippingInfo event
      (window as any).fbq("track", "AddShippingInfo", {
        address: {
          city: selectedAddress.city,
          state: selectedAddress.governorate,
          country: selectedAddress.country,
          postal_code: selectedAddress.postalCode,
        },
        shipping_method: selectedShipping?.category || "standard",
        shipping_cost: shippingCost,
        has_free_shipping: isEligibleForFreeShipping,
      });

      // Track checkout step progress
      (window as any).fbq("trackCustom", "CheckoutStep", {
        step: 2,
        step_name: "payment",
        previous_step: "shipping",
        currency: "EGP",
        num_items: totalItems,
        value: subtotal - discount + shippingCost,
        subtotal: subtotal,
        discount_value: discount,
        shipping_cost: shippingCost,
        shipping_method: selectedShipping?.category || "standard",
        has_free_shipping: isEligibleForFreeShipping,
      });
    }
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = async (data: PaymentFormData) => {
    setPaymentData(data);
    setLoading(true);
    console.log(selectedAddress);
    console.log(cart);

    // Track payment step initiation
    if (typeof window !== "undefined" && (window as any).fbq) {
      const subtotal = cart.items.reduce(
        (total, item) => total + (item.price || 0) * item.quantity,
        0
      );
      const totalItems = cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const isEligibleForFreeShipping = totalItems >= 3 || subtotal >= 1500;
      const discount = subtotal >= 1500 ? subtotal * 0.1 : 0;
      const shippingCost =
        selectedShipping && !isEligibleForFreeShipping
          ? selectedShipping.cost
          : 0;
      const finalTotal = subtotal - discount + shippingCost;

      // Track payment info addition
      (window as any).fbq("track", "AddPaymentInfo", {
        value: finalTotal,
        currency: "EGP",
        payment_method: data.paymentMethod,
        contents: cart.items.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
          price: item.price || 0,
        })),
      });

      // Track checkout step progress
      (window as any).fbq("trackCustom", "CheckoutStep", {
        step: 3,
        step_name: "confirmation",
        previous_step: "payment",
        value: finalTotal,
        currency: "EGP",
        num_items: totalItems,
        contents: cart.items.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
          price: item.price || 0,
        })),
        subtotal: subtotal,
        discount_value: discount,
        shipping_cost: shippingCost,
        shipping_method: selectedShipping?.category || "standard",
        has_free_shipping: isEligibleForFreeShipping,
        discount_code: subtotal >= 1500 ? "10_PERCENT_OFF" : null,
        payment_method: data.paymentMethod,
      });
    }

    // Prepare order data
    const orderData = {
      userId: selectedAddress._id,
      products: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      const result = await orderService.createOrder(orderData);

      if (result?.success) {
        setOrderMessage(result.message);
        toast.success(result.message);

        // Track successful purchase
        if (typeof window !== "undefined" && (window as any).fbq) {
          const subtotal = cart.items.reduce(
            (total, item) => total + (item.price || 0) * item.quantity,
            0
          );
          const totalItems = cart.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const isEligibleForFreeShipping = totalItems >= 3 || subtotal >= 1500;
          const discount = subtotal >= 1500 ? subtotal * 0.1 : 0;
          const shippingCost =
            selectedShipping && !isEligibleForFreeShipping
              ? selectedShipping.cost
              : 0;
          const finalTotal = subtotal - discount + shippingCost;

          // Track final purchase completion
          (window as any).fbq("track", "Purchase", {
            value: finalTotal,
            subtotal: subtotal,
            discount_value: discount,
            shipping_cost: shippingCost,
            shipping_method: selectedShipping?.category || "standard",
            has_free_shipping: isEligibleForFreeShipping,
            discount_code: subtotal >= 1500 ? "10_PERCENT_OFF" : null,
            currency: "EGP",
            contents: cart.items.map((item) => ({
              id: item.productId,
              quantity: item.quantity,
              price: item.price || 0,
            })),
            content_type: "product",
            checkout_complete: true,
          });
        }

        clearCart();
        setShippingData(result.data.order);
        setCurrentStep("confirmation");
      } else {
        setOrderMessage("Failed to create order. Please try again.");
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error creating order:", error);
      setOrderMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const handleAddressSelect = (address: Address) => {
  //   setSelectedAddress(address);
  // };

  return cart.items.length || orderSummaryPreview?.items.length ? (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Checkout Progress */}
      <div className="mb-12">
        <div className="flex items-center justify-center">
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
                  className="w-16 md:w-24 h-0.5 mx-3"
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
      <div className="relative h-fit overflow-visible grid grid-cols-1 lg:grid-cols-12 md:gap-12">
        {/* Forms */}
        <div className="lg:col-span-8">
          {currentStep === "shipping" && (
            <div className="container mx-auto py-4 md:py-8">
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
              selectedAddress={selectedAddress}
              shippingData={shippingData}
            />
          )}
        </div>

        {/* Order Summary */}
        <div className="sticky top-0 lg:col-span-4 z-10">
          <OrderSummary orderSummaryPreview={orderSummaryPreview} />
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="text-white text-shadow-light">
            Processing your order...
          </div>
        </div>
      )}

      {orderMessage && (
        <div className="mt-4 text-center text-lg text-green-600">
          {orderMessage}
        </div>
      )}
    </div>
  ) : null;
}
