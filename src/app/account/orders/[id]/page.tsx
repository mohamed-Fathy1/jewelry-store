"use client";

import { useState, useEffect } from "react";
import { orderService } from "@/services/order.service";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { colors } from "@/constants/colors";
import { adminService } from "@/services/admin.service";
import Image from "next/image";
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
      color: colors.peach,
    },
    confirmed: {
      label: "Confirmed",
      description: "Order has been confirmed",
      color: colors.gold,
    },
    ordered: {
      label: "Processing",
      description: "Order is being processed",
      color: colors.brown,
    },
    shipped: {
      label: "Shipped",
      description: "Package is on its way",
      color: colors.accentDark,
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
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div>
            <h1
              className="text-xl md:text-2xl font-semibold mb-2"
              style={{ color: colors.textPrimary }}
            >
              Order #{order._id.slice(-8)}
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <div
              className="text-lg font-semibold mb-1"
              style={{ color: colors.textPrimary }}
            >
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
              className="absolute h-[2px] bg-gray-200"
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
                        ? "text-white"
                        : "bg-gray-200 text-gray-400"
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
                  <span className="text-[10px] md:text-xs lg:text-sm text-center text-gray-600 px-1">
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
              className="px-4 py-2 rounded-md text-white transition-colors"
              style={{ backgroundColor: colors.brown }}
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: colors.textPrimary }}
            >
              Order Items
            </h2>
            <div className="space-y-4">
              {order.products.map((item) => (
                <div key={item._id} className="flex gap-4 border-b pb-4">
                  {typeof item.productId === "object" && (
                    <div className="w-20 h-20 relative flex-shrink-0">
                      <Image
                        src={item.productId.defaultImage.mediaUrl}
                        alt={item.productName}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3
                      className="font-medium"
                      style={{ color: colors.textPrimary }}
                    >
                      {item.productName}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      Quantity: {item.quantity}
                    </p>
                    <p
                      className="text-sm font-medium mt-1"
                      style={{ color: colors.textPrimary }}
                    >
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: colors.textPrimary }}
            >
              Shipping Details
            </h2>
            {order.userInformation && (
              <div className="space-y-2">
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  <span className="font-medium">Phone:</span>{" "}
                  {order.userInformation.primaryPhone}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  <span className="font-medium">Address:</span>{" "}
                  {order.userInformation.address}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  <span className="font-medium">Location:</span>{" "}
                  {order.userInformation.governorate},{" "}
                  {order.userInformation.country}
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: colors.textPrimary }}
            >
              Order Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>Subtotal</span>
                <span style={{ color: colors.textPrimary }}>
                  {formatPrice(order.price - order.shipping.cost)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>Shipping</span>
                <span style={{ color: colors.textPrimary }}>
                  {formatPrice(order.shipping.cost)}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span style={{ color: colors.textPrimary }}>Total</span>
                  <span style={{ color: colors.textPrimary }}>
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
