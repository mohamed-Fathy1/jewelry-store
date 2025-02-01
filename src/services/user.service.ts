import axios from "axios";
import { UserResponse } from "@/types/user.types";
import { authService } from "./auth.service";

// Use the NEXT_PUBLIC_API_URL from the environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests with token refresh
axiosInstance.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("accessToken");
  const userStr = localStorage.getItem("authUser");

  if (token && userStr) {
    const user = JSON.parse(userStr);

    // Check if token is expired
    if (authService.isTokenExpired(token)) {
      try {
        // Try to get a new token
        const response = await authService.refreshToken(user.email);
        if (response.success && response.data.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
          config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        }
      } catch (error) {
        // If refresh fails, clear storage and let the 401 handler take over
        localStorage.removeItem("accessToken");
        localStorage.removeItem("authUser");
        return config;
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const userStr = localStorage.getItem("authUser");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const response = await authService.refreshToken(user.email);

          if (response.success && response.data.accessToken) {
            localStorage.setItem("accessToken", response.data.accessToken);
            axiosInstance.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${response.data.accessToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, clear storage and logout
          localStorage.removeItem("authUser");
          localStorage.removeItem("accessToken");
        }
      }
    }
    return Promise.reject(error);
  }
);

export const userService = {
  async getUserInformation(): Promise<UserResponse> {
    const userStr = localStorage.getItem("authUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      const response = await axiosInstance.get<UserResponse>(
        `/user/user-information`
      );
      return response.data;
    }
    return { success: false, message: "User not found", statusCode: 404 };
  },

  async updateProfile(data: any, id: string): Promise<UserResponse> {
    const response = await axiosInstance.patch<UserResponse>(
      `/user/update-user-information/${id}`,
      data
    );
    return response.data;
  },

  async addProfile(data: any): Promise<UserResponse> {
    const response = await axiosInstance.post<UserResponse>(
      `/user/add-user-information`,
      data
    );
    return response.data;
  },

  // Handle 401 responses
  setupResponseInterceptor(logout: () => void) {
    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          logout();
        }
        return Promise.reject(error);
      }
    );
  },

  async deleteUserInformation(id: string): Promise<UserResponse> {
    const response = await axiosInstance.delete<UserResponse>(
      `/user/delete-user-information/${id}`
    );
    return response.data;
  },
};
