import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the access token
axiosInstance.interceptors.request.use(
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
  async getAllWishlist(page: number = 1): Promise<any> {
    try {
      const response = await axiosInstance.get(
        `/wishlist/get-all-wishlist?page=${page}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      throw new Error("Failed to fetch wishlist");
    }
  },

  async deleteFavoriteProduct(productId: string): Promise<any> {
    try {
      const response = await axiosInstance.delete(
        `/wishlist/delete-favorite-product/${productId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting favorite product:", error);
      throw new Error("Failed to delete favorite product");
    }
  },

  async addFavoriteProduct(productId: string): Promise<any> {
    try {
      const response = await axiosInstance.post(
        `/wishlist/add-to-wishlist`,
        { productId } // Sending the productId in the request body
      );
      return response.data;
    } catch (error) {
      console.error("Error adding favorite product:", error);
      throw new Error("Failed to add favorite product");
    }
  },
};
