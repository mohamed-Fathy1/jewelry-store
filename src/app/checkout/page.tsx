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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { analytics } from "@/lib";

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
  const { isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [loading, setLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [orderSummaryPreview, setOrderSummaryPreview] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) return;

    const fullPath = searchParamsString
      ? `${pathname}?${searchParamsString}`
      : pathname;

    try {
      localStorage.setItem("returnUrl", fullPath);
    } catch (storageError: unknown) {
      console.error("Failed to store returnUrl before redirect", storageError);
    }

    const encodedReturnUrl = encodeURIComponent(fullPath);
    router.replace(`/auth/login?returnUrl=${encodedReturnUrl}`);
  }, [isAuthenticated, isLoading, pathname, searchParamsString, router]);

  useEffect(() => {
    setIsClient(true);
    // Initiate checkout (no PII)
    const subtotal = cart.items.reduce(
      (total, item) => total + (item.price || 0) * item.quantity,
      0
    );
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const discount = subtotal >= 1500 ? subtotal * 0.1 : 0;
    analytics.trackInitiateCheckout({
      currency: "EGP",
      numItems: totalItems,
      value: subtotal - discount,
      contents: cart.items.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        price: item.price || 0,
      })),
    });
  }, []);

  useEffect(() => {
    console.log(cart);
    if (!cart.items.length && !orderSummaryPreview?.items.length && isClient) {
      router.push("/");
    } else if (cart.items.length && isClient) {
      // Track cart view (no PII)
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

      analytics.trackViewCart({
        currency: "EGP",
        numItems: totalItems,
        value: finalTotal,
        contents: cart.items.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
          price: item.price || 0,
        })),
      });
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

  // Emit step-entered event on each step change (no PII)
  useEffect(() => {
    if (!isClient) return;
    const hasItems = cart.items.length || orderSummaryPreview?.items?.length;
    if (!hasItems) return;

    const subtotal = cart.items.reduce(
      (total, item) => total + (item.price || 0) * item.quantity,
      0
    );
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const isEligibleForFreeShipping = totalItems >= 3 || subtotal >= 1500;
    const discount = subtotal >= 1500 ? subtotal * 0.1 : 0;
    const shippingCost =
      selectedShipping && !isEligibleForFreeShipping
        ? selectedShipping.cost
        : 0;
    const finalTotal = subtotal - discount + shippingCost;

    const stepMap: Record<CheckoutStep, 1 | 2 | 3> = {
      shipping: 1,
      payment: 2,
      confirmation: 3,
    };

    analytics.trackCheckoutStep(stepMap[currentStep], {
      stepName: currentStep,
      currency: "EGP",
      numItems: totalItems,
      value: finalTotal,
      contents: cart.items.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        price: item.price || 0,
      })),
    });
  }, [
    currentStep,
    isClient,
    cart.items,
    selectedShipping,
    orderSummaryPreview,
  ]);

  // Reflect current step in the URL query (preserve existing params like utm, fbclid)
  useEffect(() => {
    if (!pathname) return;
    try {
      const params = new URLSearchParams(searchParams?.toString() || "");
      const currentInUrl = params.get("step");
      if (currentInUrl === currentStep) return;
      params.set("step", currentStep);
      const nextUrl = `${pathname}?${params.toString()}`;
      router.replace(nextUrl, { scroll: false });
    } catch {
      // ignore URL errors; do not interrupt checkout
    }
  }, [currentStep, pathname, searchParams, router, isClient]);

  const handleShippingSubmit = (data: ShippingFormData) => {
    if (!selectedShipping) {
      toast.error("please select a shpping method");
      return;
    }
    if (!selectedAddress) {
      toast.error("please select a shpping address");
      return;
    }
    // Track shipping step completion (no PII)
    const subtotal = cart.items.reduce(
      (total, item) => total + (item.price || 0) * item.quantity,
      0
    );
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const isEligibleForFreeShipping = totalItems >= 3 || subtotal >= 1500;
    const discount = subtotal >= 1500 ? subtotal * 0.1 : 0;
    const shippingCost =
      selectedShipping && !isEligibleForFreeShipping
        ? selectedShipping.cost
        : 0;

    analytics.trackAddShippingInfo({
      currency: "EGP",
      numItems: totalItems,
      value: subtotal - discount + shippingCost,
      shippingMethod: selectedShipping?.category || "standard",
      shippingCost,
      contents: cart.items.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        price: item.price || 0,
      })),
    });

    analytics.trackCheckoutStep(2, {
      stepName: "payment",
      currency: "EGP",
      numItems: totalItems,
      value: subtotal - discount + shippingCost,
      contents: cart.items.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        price: item.price || 0,
      })),
    });
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = async (data: PaymentFormData) => {
    setPaymentData(data);
    setLoading(true);
    console.log(selectedAddress);
    console.log(cart);

    // Track payment step initiation
    const subtotal = cart.items.reduce(
      (total, item) => total + (item.price || 0) * item.quantity,
      0
    );
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const isEligibleForFreeShipping = totalItems >= 3 || subtotal >= 1500;
    const discount = subtotal >= 1500 ? subtotal * 0.1 : 0;
    const shippingCost =
      selectedShipping && !isEligibleForFreeShipping
        ? selectedShipping.cost
        : 0;
    const finalTotal = subtotal - discount + shippingCost;

    analytics.trackAddPaymentInfo({
      currency: "EGP",
      numItems: totalItems,
      value: finalTotal,
      paymentMethod: data.paymentMethod,
      contents: cart.items.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        price: item.price || 0,
      })),
    });

    analytics.trackCheckoutStep(3, {
      stepName: "confirmation",
      currency: "EGP",
      numItems: totalItems,
      value: finalTotal,
      contents: cart.items.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        price: item.price || 0,
      })),
    });

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
        {
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

          analytics.trackPurchase({
            currency: "EGP",
            numItems: totalItems,
            value: finalTotal,
            contents: cart.items.map((item) => ({
              id: item.productId,
              quantity: item.quantity,
              price: item.price || 0,
            })),
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

  if (isLoading || !isAuthenticated) {
    return <LoadingSpinner />;
  }

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
