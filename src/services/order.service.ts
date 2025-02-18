import api from "@/lib/axios";
import toast from "react-hot-toast";
import { OrderResponse } from "@/types/order.types"; // You might need to create this type

export const orderService = {
  async createOrder(orderData: any): Promise<OrderResponse> {
    const response = await api.post(`/order/create`, orderData);
    return response.data;
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
