"use client";

import { useState, useEffect } from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { colors } from "@/constants/colors";
import { formatPrice } from "@/utils/format";
import { Order } from "@/types/order.types";
import { adminService } from "@/services/admin.service";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface OrderListProps {
  onViewDetails: (order: Order) => void;
}

export default function OrderList({ onViewDetails }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentStatus, setCurrentStatus] = useState<Order["status"] | "all">(
    "all"
  );

  const fetchOrders = async (page: number, status: typeof currentStatus) => {
    setIsLoading(true);
    try {
      let response;
      if (status === "all") {
        response = await adminService.getAllOrders(page);
      } else {
        response = await adminService.getOrdersByStatus(
          status as Order["status"],
          page
        );
      }
      setOrders(response.data.orders);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, currentStatus);
  }, [currentPage, currentStatus]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated successfully");
      fetchOrders(currentPage, currentStatus);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      under_review: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      delivered: "bg-green-100 text-green-800",
    };
    return colors[status];
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {/* Status Filter */}
      <div className="mb-4 flex gap-2">
        {["all", "under_review", "confirmed", "cancelled", "delivered"].map(
          (status) => (
            <button
              key={status}
              onClick={() => {
                setCurrentStatus(status as typeof currentStatus);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full text-sm ${
                currentStatus === status
                  ? "bg-brown text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {formatStatus(status)}
            </button>
          )
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Order Details
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Customer Info
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Products
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      #{order._id.slice(-8)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      {formatPrice(order.price)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    {order.userInformation ? (
                      <>
                        <div className="text-sm text-gray-900">
                          {order.userInformation.primaryPhone}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.userInformation.governorate},{" "}
                          {order.userInformation.country}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.userInformation.address}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No customer information
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    {order.products.map((product, index) => (
                      <div key={index} className="flex items-center">
                        {typeof product.productId === "object" && (
                          <div className="h-10 w-10 relative flex-shrink-0 mr-2">
                            <Image
                              src={product.productId.defaultImage.mediaUrl}
                              alt={product.productName}
                              fill
                              className="rounded-md object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">
                            {product.productName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {product.quantity} ×{" "}
                            {formatPrice(product.itemPrice)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(
                        order._id,
                        e.target.value as Order["status"]
                      )
                    }
                    className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <option value="under_review">Under Review</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onViewDetails(order)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
