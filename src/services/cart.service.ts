import axios from "axios";
import { CartResponse, CartPreview } from "@/types/cart.types";

// Dedicated instance: it attaches the Bearer token (the cart/stock endpoints
// require auth) via a request interceptor, but deliberately has NO response
// interceptor. The shared @/lib/axios instance wipes accessToken + authUser on
// ANY 401, which would silently log a customer out when the cart's background
// stock check happens to hit an expired token. Here a 401 just rejects and is
// swallowed by the caller's try/catch, leaving the session intact.
const cartApi = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });
cartApi.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const response = await cartApi.get<CartResponse>(`/cart/get-cart`);
    return response.data;
  },

  async addToCart(productId: string, quantity: number): Promise<CartResponse> {
    const response = await cartApi.post<CartResponse>(`/cart/add-to-cart`, {
      productId,
      quantity,
    });
    return response.data;
  },

  async removeFromCart(productId: string): Promise<CartResponse> {
    const response = await cartApi.delete<CartResponse>(
      `/cart/remove-from-cart/${productId}`
    );
    return response.data;
  },

  async updateQuantity(
    productId: string,
    quantity: number
  ): Promise<CartResponse> {
    const response = await cartApi.patch<CartResponse>(`/cart/update-quantity`, {
      productId,
      quantity,
    });
    return response.data;
  },

  // Product-level totals (sum across variants) — for legacy variant-less items.
  // → { [productId]: { availableItems, finalPrice } }. finalPrice lets the cart
  // refresh its stale price snapshot to the live price.
  async checkStockAmount(
    productIds
  ): Promise<Record<string, { availableItems: number; finalPrice: number | null }>> {
    const response = await cartApi.post("/products/available-items", {
      products: productIds,
    });
    return response.data;
  },

  // Per-variant availability → { [variantId]: { availableItems, finalPrice } }.
  // The cart validates each line against its exact color+size variant, not the
  // product-level total; finalPrice refreshes the line's price.
  async checkVariantStock(
    variantIds: string[]
  ): Promise<Record<string, { availableItems: number; finalPrice: number | null }>> {
    const response = await cartApi.post("/products/variants-availability", {
      variantIds,
    });
    return response.data;
  },

  // Public, no auth/address: live offer & flash-sale pricing for the cart page.
  // Returns null on any failure so the cart falls back to its snapshot totals.
  async previewCart(
    items: Array<{ productId?: string; variantId?: string; quantity: number }>
  ): Promise<CartPreview | null> {
    try {
      const response = await cartApi.post("/products/cart-preview", { items });
      return response.data?.data ?? null;
    } catch {
      return null;
    }
  },
};
