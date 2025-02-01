import axios from "axios";
import toast from "react-hot-toast";

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

export const orderService = {
  async createOrder(orderData): Promise<any> {
    // Adjust the return type as needed
    try {
      const response = await axiosInstance.post(`/order/create`, orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("Failed to create order");
    }
  },
  async getUserOrders(): Promise<any> {
    try {
      const response = await axiosInstance.get(`/order/get-user-orders`);
      return response.data;
    } catch (error) {
      toast.error(error);
      console.error("Error fetching user orders:", error);
      throw new Error("Failed to fetch user orders");
    }
  },
  // ... existing code ...
};
