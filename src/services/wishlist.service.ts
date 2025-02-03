import api from "@/lib/axios";
import { WishlistResponse } from "@/types/wishlist.types"; // You might need to create this type

// Add a request interceptor to include the access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // Retrieve token from local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Set the token in the Authorization header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const wishlistService = {
  async getAllWishlist(page: number = 1): Promise<WishlistResponse> {
    try {
      const response = await api.get(`/wishlist/get-all-wishlist?page=${page}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      throw new Error("Failed to fetch wishlist");
    }
  },

  async deleteFavoriteProduct(productId: string): Promise<WishlistResponse> {
    try {
      const response = await api.delete(
        `/wishlist/delete-favorite-product/${productId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting favorite product:", error);
      throw new Error("Failed to delete favorite product");
    }
  },

  async addFavoriteProduct(productId: string): Promise<WishlistResponse> {
    try {
      const response = await api.post(`/wishlist/add-to-wishlist`, {
        productId,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding favorite product:", error);
      throw new Error("Failed to add favorite product");
    }
  },
};
