"use client";

import { useState, useEffect } from "react";
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
import { getApiErrorMessage } from "@/utils/apiError";

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
  const { cart, clearCart } = useCart();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [loading, setLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [orderSummaryPreview, setOrderSummaryPreview] = useState(null);
  // Backend-computed pricing (offers, discount, free shipping, totals). The
  // frontend no longer calculates any of this — see the /order/preview effect.
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
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

  // Ask the backend to price the cart (offers + discount + free shipping + total)
  // whenever the cart or the selected address changes. This replaces every piece
  // of offer math that used to live in the frontend.
  useEffect(() => {
    const source = cart.items.length
      ? cart.items
      : orderSummaryPreview?.items ?? [];

    // Send the same identity the cart holds: variantId when a variant was picked,
    // otherwise productId (the backend resolves the variant). Needs an address to
    // know the shipping cost, so skip until one is selected.
    if (!selectedAddress?._id || !source.length) {
      setPreview(null);
      return;
    }

    const items = source.map((it) => ({
      productId: it.productId,
      variantId: it.variantId,
      quantity: it.quantity,
    }));

    let cancelled = false;
    setPreviewLoading(true);
    orderService
      .previewOrder({ items, userInformationId: selectedAddress._id })
      .then((res) => {
        if (!cancelled) setPreview(res);
      })
      .catch((err) => {
        if (!cancelled) setPreview(null);
        console.error("Failed to load order preview:", err);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cart.items, selectedAddress, orderSummaryPreview]);

  // Analytics value helpers — read the backend preview instead of recomputing
  // offers on the client. Falls back to the plain line-item subtotal until the
  // preview has loaded.
  const getAnalyticsTotals = () => {
    const source = cart.items.length
      ? cart.items
      : orderSummaryPreview?.items ?? [];
    const subtotal = source.reduce(
      (total, item) => total + (item.price || 0) * item.quantity,
      0
    );
    const totalItems = source.reduce((sum, item) => sum + item.quantity, 0);
    const value = preview ? preview.totalAmount : subtotal;
    return { subtotal, totalItems, value };
  };

  useEffect(() => {
    setIsClient(true);
    // Initiate checkout (no PII)
    const { totalItems, value } = getAnalyticsTotals();
    analytics.trackInitiateCheckout({
      currency: "EGP",
      numItems: totalItems,
      value,
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
      const { totalItems, value } = getAnalyticsTotals();

      analytics.trackViewCart({
        currency: "EGP",
        numItems: totalItems,
        value,
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

    const { totalItems, value } = getAnalyticsTotals();

    const stepMap: Record<CheckoutStep, 1 | 2 | 3> = {
      shipping: 1,
      payment: 2,
      confirmation: 3,
    };

    analytics.trackCheckoutStep(stepMap[currentStep], {
      stepName: currentStep,
      currency: "EGP",
      numItems: totalItems,
      value,
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
    const { totalItems, value } = getAnalyticsTotals();
    const shippingCost = preview
      ? preview.freeShipping
        ? 0
        : preview.shippingCost
      : selectedShipping?.cost ?? 0;

    analytics.trackAddShippingInfo({
      currency: "EGP",
      numItems: totalItems,
      value,
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
      value,
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
    const { totalItems, value } = getAnalyticsTotals();

    analytics.trackAddPaymentInfo({
      currency: "EGP",
      numItems: totalItems,
      value,
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
      value,
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
        variantId: item.variantId,
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
          const { totalItems, value } = getAnalyticsTotals();

          analytics.trackPurchase({
            currency: "EGP",
            numItems: totalItems,
            value,
            transactionId: (result.data?.order as any)?._id,
            contents: cart.items.map((item) => ({
              id: item.variantId ?? item.productId,
              quantity: item.quantity,
              price: item.price || 0,
            })),
          });
        }

        clearCart();
        setShippingData(result.data.order as any);
        setCurrentStep("confirmation");
      } else {
        setOrderMessage("Failed to create order. Please try again.");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to place your order. Please try again."));
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
          {["shipping", "payment", "confirmation"].map((step, index) => {
            const currentIndex = [
              "shipping",
              "payment",
              "confirmation",
            ].indexOf(currentStep);
            const isCurrent = currentStep === step;
            const isCompleted = index < currentIndex;
            return (
              <div key={step} className="flex items-center">
                <div
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200 ${
                    isCurrent
                      ? "bg-primary text-on-primary"
                      : isCompleted
                      ? "bg-accent text-on-primary"
                      : "bg-surface-muted text-ink-muted border border-hairline"
                  }`}
                >
                  {index + 1}
                  <span
                    className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-base capitalize ${
                      isCurrent
                        ? "text-heading font-medium"
                        : "text-ink-muted"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`w-16 md:w-24 h-0.5 mx-3 ${
                      isCompleted ? "bg-accent" : "bg-hairline"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="invisible flex justify-center mt-2">
          <span
            className={
              currentStep === "shipping" ? "text-heading" : "text-ink-muted"
            }
          >
            Shipping
          </span>
          <span
            className={
              currentStep === "payment" ? "text-heading" : "text-ink-muted"
            }
          >
            Payment
          </span>
          <span
            className={
              currentStep === "confirmation"
                ? "text-heading"
                : "text-ink-muted"
            }
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
          <OrderSummary
            orderSummaryPreview={orderSummaryPreview}
            preview={preview}
            previewLoading={previewLoading}
          />
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-noir/50 z-50">
          <div className="text-on-primary">Processing your order...</div>
        </div>
      )}

      {orderMessage && (
        <div className="mt-4 text-center text-lg text-accent">
          {orderMessage}
        </div>
      )}
    </div>
  ) : null;
}
