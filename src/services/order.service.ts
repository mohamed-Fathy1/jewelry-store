import api from "@/lib/axios";
import toast from "react-hot-toast";
import { OrderResponse, OrdersResponse } from "@/types/order.types";

export const orderService = {
  async createOrder(orderData: any): Promise<OrderResponse> {
    const response = await api.post(`/order`, orderData);
    return response.data;
  },

  // Single source of truth for cart pricing: the backend computes subtotal,
  // offers/discounts, free shipping and the final total. The frontend never
  // recalculates any of this. Returns the unwrapped preview payload (the
  // backend wraps it in an ApiResponse envelope: { data: <preview> }).
  async previewOrder(payload: {
    items: Array<{ variantId: string; quantity: number }>;
    userInformationId: string;
  }): Promise<any> {
    const response = await api.post(`/order/preview`, payload);
    return response.data?.data;
  },

  // Customer-initiated cancellation. Hits the user order route
  // (PATCH /order/cancel/:orderId) which restocks inventory and emails the
  // customer + admins. Distinct from the admin status-update endpoint.
  async cancelOrder(orderId: string): Promise<OrderResponse> {
    const response = await api.patch(`/order/cancel/${orderId}`);
    return response.data;
  },

  async getUserOrders(): Promise<OrdersResponse> {
    try {
      const response = await api.get(`/order/get-user-orders`);
      return response.data;
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error("Error fetching user orders:", error);
      // Always return a well-formed response so callers can read
      // `result.success`/`result.data.orders` without a null-check crash.
      return {
        statusCode: 500,
        data: { orders: [] },
        message: "Failed to fetch orders",
        success: false,
      };
    }
  },
};
