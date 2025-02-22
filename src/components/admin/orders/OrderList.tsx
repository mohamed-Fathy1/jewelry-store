"use client";

import { useState, useEffect } from "react";
import {
  EyeIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
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

type OrderStatus =
  | "all"
  | "under_review"
  | "confirmed"
  | "ordered"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "deleted";

export default function OrderList({ onViewDetails }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchId, setSearchId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus | "all">(
    "all"
  );
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (
    page: number,
    status: typeof currentStatus,
    searchId
  ) => {
    setIsLoading(true);
    try {
      const response = await adminService.getAllOrders(page, status, searchId);
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, currentStatus, searchId);
  }, [currentPage, currentStatus]);

  const getAvailableStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const statusFlow = {
      under_review: ["confirmed", "deleted"],
      confirmed: ["ordered", "deleted"],
      ordered: ["shipped", "deleted"],
      shipped: ["delivered", "deleted"],
      delivered: ["deleted"],
      cancelled: ["deleted"],
      deleted: [],
    };

    return statusFlow[currentStatus] || [];
  };

  const isStatusChangeAllowed = (
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ): boolean => {
    if (newStatus === "cancelled") return false;

    const availableStatuses = getAvailableStatuses(currentStatus);
    return availableStatuses.includes(newStatus);
  };

  const statusOptions: OrderStatus[] = [
    "all",
    "under_review",
    "confirmed",
    "ordered",
    "shipped",
    "delivered",
    "cancelled",
    "deleted",
  ];

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      const order = orders.find((o) => o._id === orderId);
      if (!order) return;

      if (!isStatusChangeAllowed(order.status, newStatus)) {
        toast.error("This status transition is not allowed");
        return;
      }

      await adminService.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated successfully");
      fetchOrders(currentPage, currentStatus, searchId);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      under_review: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      ordered: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      deleted: "bg-gray-100 text-gray-800",
    };
    return colors[status];
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const filteredOrders = orders.filter((order) =>
    order._id.includes(searchId.replace("#", ""))
  );

  return (
    <div>
      {/* Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchOrders(currentPage, currentStatus, searchId.replace("#", ""));
        }}
        className="mb-4 flex gap-3 items-center"
      >
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Search by Order ID (8 characters)"
          className="border rounded p-2 flex-1 max-w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.background,
            color: colors.textPrimary,
          }}
        />
        <button
          type="submit"
          className="bg-brown text-white rounded py-2 px-4 flex items-center"
          style={{
            backgroundColor: colors.brown,
            borderColor: colors.border,
          }}
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </form>

      {/* Status Filter */}
      <div className="mb-4 flex gap-2 w-full overflow-x-auto">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => {
              setCurrentStatus(status as typeof currentStatus);
              setCurrentPage(1);
            }}
            className={`px-4 py-1 rounded-xl text-sm font-medium transition-colors ${
              currentStatus === status
                ? `text-white`
                : `text-textPrimary hover:bg-accentLight`
            }`}
            style={{
              backgroundColor:
                currentStatus === status ? colors.brown : colors.background,
              borderWidth: "1px",
              borderColor: colors.border,
            }}
          >
            {formatStatus(status)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : !orders || orders.length === 0 ? (
        <>
          {/* Empty State */}
          <div
            className="text-center py-12 px-4 border-2 border-dashed rounded-lg"
            style={{ borderColor: colors.border }}
          >
            <ShoppingBagIcon
              className="mx-auto h-16 w-16 mb-4"
              style={{ color: colors.textSecondary }}
            />
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: colors.textPrimary }}
            >
              No Orders Found
            </h3>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              {currentStatus === "all"
                ? "There are no orders in the system yet."
                : `No orders with status "${formatStatus(
                    currentStatus
                  )}" found.`}
            </p>
            {currentStatus !== "all" && (
              <button
                onClick={() => {
                  setSearchId("");
                  setCurrentStatus("all");
                }}
                className="text-sm font-medium px-4 py-2 rounded-md transition-colors"
                style={{
                  backgroundColor: colors.background,
                  color: colors.textPrimary,
                  borderWidth: "1px",
                  borderColor: colors.border,
                }}
              >
                View All Orders
              </button>
            )}
          </div>
        </>
      ) : (
        <>
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
                              {order.shipping.category},{" "}
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
                        {order.products?.map((product, index) => (
                          <div key={index} className="flex items-center">
                            {typeof product.productId === "object" && (
                              <div className="h-10 w-10 relative flex-shrink-0 mr-2">
                                <Image
                                  src={
                                    product?.productId?.defaultImage?.mediaUrl
                                  }
                                  alt={product?.productName}
                                  fill
                                  className="rounded-md object-cover"
                                />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-900">
                                {product?.productName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {product?.quantity} ×{" "}
                                {formatPrice(product?.itemPrice)}
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
                            e.target.value as OrderStatus
                          )
                        }
                        className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                        disabled={
                          !getAvailableStatuses(order.status as OrderStatus)
                            .length
                        }
                      >
                        <option value={order.status}>
                          {formatStatus(order.status)}
                        </option>
                        {getAvailableStatuses(order.status as OrderStatus).map(
                          (status) => (
                            <option key={status} value={status}>
                              {formatStatus(status)}
                            </option>
                          )
                        )}
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

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                backgroundColor: colors.brown,
                color: colors.textLight,
              }}
            >
              Previous
            </button>
            <span
              className="text-sm font-medium"
              style={{ color: colors.textPrimary }}
            >
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              style={{
                backgroundColor: colors.brown,
                color: colors.textLight,
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
