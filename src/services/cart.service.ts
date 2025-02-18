import axios from "axios";
import { CartResponse } from "@/types/cart.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const response = await axiosInstance.get<CartResponse>(`/cart/get-cart`);
    return response.data;
  },

  async addToCart(productId: string, quantity: number): Promise<CartResponse> {
    const response = await axiosInstance.post<CartResponse>(
      `/cart/add-to-cart`,
      {
        productId,
        quantity,
      }
    );
    return response.data;
  },

  async removeFromCart(productId: string): Promise<CartResponse> {
    const response = await axiosInstance.delete<CartResponse>(
      `/cart/remove-from-cart/${productId}`
    );
    return response.data;
  },

  async updateQuantity(
    productId: string,
    quantity: number
  ): Promise<CartResponse> {
    const response = await axiosInstance.patch<CartResponse>(
      `/cart/update-quantity`,
      {
        productId,
        quantity,
      }
    );
    return response.data;
  },

  async checkStockAmount(productIds) {
    const response = await await axiosInstance.post(
      "/public/product/available-items",
      {
        products: productIds,
      }
    );
    return response.data;
  },
};
