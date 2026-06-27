import api from "@/lib/axios";
import { CartResponse } from "@/types/cart.types";

// Use the shared `api` instance (from @/lib/axios) so the request interceptor
// attaches the Bearer token. A bare axios.create() here would send cart/stock
// requests unauthenticated and get 401s even for logged-in users.

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const response = await api.get<CartResponse>(`/cart/get-cart`);
    return response.data;
  },

  async addToCart(productId: string, quantity: number): Promise<CartResponse> {
    const response = await api.post<CartResponse>(`/cart/add-to-cart`, {
      productId,
      quantity,
    });
    return response.data;
  },

  async removeFromCart(productId: string): Promise<CartResponse> {
    const response = await api.delete<CartResponse>(
      `/cart/remove-from-cart/${productId}`
    );
    return response.data;
  },

  async updateQuantity(
    productId: string,
    quantity: number
  ): Promise<CartResponse> {
    const response = await api.patch<CartResponse>(`/cart/update-quantity`, {
      productId,
      quantity,
    });
    return response.data;
  },

  // Product-level totals (sum across variants) — for legacy variant-less items.
  async checkStockAmount(productIds): Promise<Record<string, number>> {
    const response = await api.post("/products/available-items", {
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
    const response = await api.post("/products/variants-availability", {
      variantIds,
    });
    return response.data;
  },
};
