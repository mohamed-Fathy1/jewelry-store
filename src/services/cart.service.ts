import axios from "axios";
import { CartResponse } from "@/types/cart.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
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

  // Product-level totals (sum across variants) — for legacy variant-less items.
  async checkStockAmount(productIds): Promise<Record<string, number>> {
    const response = await axiosInstance.post("/products/available-items", {
      products: productIds,
    });
    return response.data;
  },

  // Per-variant availability → { [variantId]: availableItems }. The cart
  // validates each line against its exact color+size variant, not the
  // product-level total.
  async checkVariantStock(
    variantIds: string[]
  ): Promise<Record<string, number>> {
    const response = await axiosInstance.post(
      "/products/variants-availability",
      { variantIds }
    );
    return response.data;
  },
};
