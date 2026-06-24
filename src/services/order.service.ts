import api from "@/lib/axios";
import toast from "react-hot-toast";
import { OrderResponse, OrdersResponse } from "@/types/order.types";

export const orderService = {
  async createOrder(orderData: any): Promise<OrderResponse> {
    const response = await api.post(`/order/create`, orderData);
    return response.data;
  },

  async getUserOrders(): Promise<OrdersResponse> {
    try {
      const response = await api.get(`/order/get-user-orders`);
      return response.data;
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error("Error fetching user orders:", error);
    }
  },
};
