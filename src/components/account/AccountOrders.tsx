"use client";

import { useEffect, useState } from "react";
import SmartImage from "@/components/ui/SmartImage";
import Link from "next/link";
import { orderService } from "@/services/order.service"; // Import the order service
import toast from "react-hot-toast";
import { adminService } from "@/services/admin.service";

export default function AccountOrders() {
  const [orders, setOrders] = useState<any[]>([]); // State to hold orders
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await orderService.getUserOrders();
        if (result.success) {
          setOrders(result.data.orders); // Set orders from the response
        } else {
          toast.error(result.message);
          console.error("Failed to fetch orders:", result.message);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "confirmed":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-surface-sunken text-ink-muted";
    }
  };

  const canCancelOrder = (status: string) => {
    // User can only cancel if order is under_review, confirmed, or ordered
    const cancellableStatuses = ["under_review", "confirmed", "ordered"];
    return cancellableStatuses.includes(status);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      await adminService.updateOrderStatus(orderId, "cancelled");
      toast.success("Order cancelled successfully");
      // Refresh orders list
      const result = await orderService.getUserOrders();
      if (result.success) {
        setOrders(result.data.orders);
      }
    } catch (error) {
      toast.error("Failed to cancel order");
      console.error("Error cancelling order:", error);
    }
  };

  if (loading) {
    return <div>Loading orders...</div>; // Loading state
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="font-display text-lg text-heading">No Orders Found</h2>
        <p className="mt-2 text-ink-muted">
          You have not placed any orders yet.
        </p>
        <Link
          href="/shop" // Link to the shop or products page
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {orders.map((order) => (
        <div
          key={order._id}
          className="rounded-2xl bg-surface-muted p-6"
        >
          {/* Order Header */}
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <p className="text-sm text-ink-muted">Order placed</p>
              <p className="font-medium text-ink">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-ink-muted">Order number</p>
              <p className="font-medium text-ink">#{order._id.slice(-8)}</p>
            </div>
            <div>
              <p className="text-sm text-ink-muted">Total</p>
              <p className="font-medium text-ink tabular-nums">
                EGP {order.price.toFixed(2)}
              </p>
            </div>
            <div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            {order.products.map((item) => (
              <div key={item.productId._id} className="flex gap-4">
                <div className="w-20 h-20 flex-shrink-0 relative overflow-hidden rounded-lg">
                  <SmartImage
                    src={item.productId.defaultImage.mediaUrl} // Ensure the image URL is correct
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-ink">{item.productName}</h3>
                  <p className="text-ink-muted">Quantity: {item.quantity}</p>
                  <p className="mt-1 text-ink tabular-nums">
                    EGP {item.itemPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Actions */}
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href={`/account/orders/${order._id}`}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Track Order
            </Link>

            {canCancelOrder(order.status) && (
              <button
                onClick={() => handleCancelOrder(order._id)}
                className="rounded-full border border-hairline bg-surface px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-hairline-strong hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
