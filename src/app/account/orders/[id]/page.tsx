"use client";

import { useState, useEffect } from "react";
import { orderService } from "@/services/order.service";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/admin.service";
import SmartImage from "@/components/ui/SmartImage";
import { formatPrice } from "@/utils/format";
import { format } from "date-fns";
import { CheckIcon } from "lucide-react";

const getStatusIndex = (status: string) => {
  const statusFlow = [
    "under_review",
    "confirmed",
    "ordered",
    "shipped",
    "delivered",
  ];
  return statusFlow.indexOf(status);
};

const getStatusDisplay = (status: string) => {
  const statusInfo = {
    under_review: {
      label: "Under Review",
      description: "Order is being reviewed",
      color: "#FFCDB2",
    },
    confirmed: {
      label: "Confirmed",
      description: "Order has been confirmed",
      color: "#D4AF37",
    },
    ordered: {
      label: "Processing",
      description: "Order is being processed",
      color: "#8B4513",
    },
    shipped: {
      label: "Shipped",
      description: "Package is on its way",
      color: "#6B4423",
    },
    delivered: {
      label: "Delivered",
      description: "Package has been delivered",
      color: "#4CAF50",
    },
    cancelled: {
      label: "Cancelled",
      description: "Order has been cancelled",
      color: "#DC2626",
    },
    deleted: {
      label: "Deleted",
      description: "Order has been deleted",
      color: "#e30505",
    },
  };
  return statusInfo[status] || statusInfo.under_review;
};

interface Props {
  params: Promise<{ id: string }>;
}

export default function OrderTrackingPage({
  params,
}: {
  params: { id: string };
}) {
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await adminService.getOrderDetails(params.id);
        setOrder(response.data.order);
      } catch (error) {
        toast.error("Failed to fetch order details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  const canCancelOrder = (status: string) => {
    const cancellableStatuses = ["under_review", "confirmed", "ordered"];
    return cancellableStatuses.includes(status);
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      await adminService.updateOrderStatus(params.id, "cancelled");
      toast.success("Order cancelled successfully");
      router.push("/account/orders");
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  const statusInfo = getStatusDisplay(order.status);
  const currentStep = getStatusIndex(order.status);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
      {/* Order Header */}
      <div className="bg-surface rounded-2xl shadow-card p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div>
            <h1 className="font-display text-xl md:text-2xl text-heading mb-2">
              Order #{order._id.slice(-8)}
            </h1>
            <p className="text-sm text-ink-muted">
              Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <div className="text-lg font-semibold mb-1 text-heading tabular-nums">
              {formatPrice(order.price)}
            </div>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: statusInfo.color + "20",
                color: statusInfo.color,
              }}
            >
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Progress Tracker */}
        {order.status !== "cancelled" && (
          <div className="relative mb-8 mt-8">
            {/* Progress Line - Adjusted positioning and width */}
            <div
              className="absolute h-[2px] bg-surface-sunken"
              style={{
                top: "25%",
                left: "10%",
                right: "10%",
                transform: "translateY(-50%)",
              }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${(currentStep / 4) * 100}%`,
                  backgroundColor: statusInfo.color,
                }}
              ></div>
            </div>

            {/* Status Points */}
            <div className="flex justify-between lg:px-4">
              {[
                "Under Review",
                "Confirmed",
                "Processing",
                "Shipped",
                "Delivered",
              ].map((status, index) => (
                <div
                  key={status}
                  className="flex flex-col items-center relative z-10 w-[20%]"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      index <= currentStep
                        ? "text-on-primary"
                        : "bg-surface-sunken text-ink-subtle"
                    }`}
                    style={{
                      backgroundColor:
                        index <= currentStep ? statusInfo.color : undefined,
                    }}
                  >
                    {index <= currentStep ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-current" />
                    )}
                  </div>
                  <span className="text-[10px] md:text-xs lg:text-sm text-center text-ink-muted px-1">
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {canCancelOrder(order.status) && (
            <button
              onClick={handleCancelOrder}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Products */}
        <div className="md:col-span-2">
          <div className="bg-surface rounded-2xl shadow-card p-6">
            <h2 className="font-display text-lg text-heading mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.products.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-4 border-b border-hairline pb-4"
                >
                  {typeof item.productId === "object" && (
                    <div className="w-20 h-20 relative flex-shrink-0 overflow-hidden rounded-lg">
                      <SmartImage
                        src={item.productId.defaultImage.mediaUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-ink">{item.productName}</h3>
                    <p className="text-sm text-ink-muted">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm font-medium mt-1 text-ink tabular-nums">
                      {formatPrice(item.itemPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="space-y-6">
          {/* Shipping Details */}
          <div className="bg-surface rounded-2xl shadow-card p-6">
            <h2 className="font-display text-lg text-heading mb-4">
              Shipping Details
            </h2>
            {order.userInformation && (
              <div className="space-y-2">
                <p className="text-sm text-ink-muted">
                  <span className="font-medium">Phone:</span>{" "}
                  {order.userInformation.primaryPhone}
                </p>
                <p className="text-sm text-ink-muted">
                  <span className="font-medium">Address:</span>{" "}
                  {order.userInformation.address}
                </p>
                <p className="text-sm text-ink-muted">
                  <span className="font-medium">Location:</span>{" "}
                  {order.shipping.category}, {order.userInformation.country}
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-surface rounded-2xl shadow-card p-6">
            <h2 className="font-display text-lg text-heading mb-4">
              Order Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Subtotal</span>
                <span className="text-ink tabular-nums">
                  {formatPrice(order.price - order.shipping.cost)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Shipping</span>
                <span className="text-ink tabular-nums">
                  {formatPrice(order.shipping.cost)}
                </span>
              </div>
              <div className="border-t border-hairline pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span className="text-ink">Total</span>
                  <span className="text-ink tabular-nums">
                    {formatPrice(order.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
