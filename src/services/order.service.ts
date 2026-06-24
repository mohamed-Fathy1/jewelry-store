import api from "@/lib/axios";
import toast from "react-hot-toast";
import { OrderResponse } from "@/types/order.types"; // You might need to create this type

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

  async getUserOrders(): Promise<OrderResponse> {
    try {
      const response = await api.get(`/order/get-user-orders`);
      return response.data;
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error("Error fetching user orders:", error);
    }
  },
};
