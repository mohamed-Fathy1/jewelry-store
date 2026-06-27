import api from "@/lib/axios";
import { AdminWishlistResponse } from "@/types/admin-wishlist.types";

// Typed client for the Admin Wishlists view.
// The Bearer token is attached by the axios request interceptor (src/lib/axios),
// which also redirects admin 401s to /admin/login — so no auth wiring is needed
// here.
export const adminWishlistService = {
  // GET /wishlist/get-all-wishlist?page=<n>
  // Page size is fixed at 20 server-side; `page` defaults to 1.
  async getAllWishlist(page: number = 1): Promise<AdminWishlistResponse> {
    try {
      const response = await api.get(
        `/wishlist/get-all-wishlist?page=${page}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching wishlists:", error);
      throw error;
    }
  },
};
