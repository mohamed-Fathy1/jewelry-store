import axios from "axios";
import { AuthResponse } from "@/types/auth.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  // withCredentials: true, // Important for handling cookies
});

export const authService = {
  // Register with email
  async registerEmail(email: string): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>(
      `/authentication/register-email`,
      { email }
    );
    return response.data;
  },

  // Activate account
  async activateAccount(
    email: string,
    activeCode: string
  ): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>(
      `/authentication/active-account`,
      { email, activeCode }
    );
    return response.data;
  },

  // Logout user
  async logout(): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>(`/user/logout`);
    return response.data;
  },

  // Refresh token - no email needed as it uses HTTP-only cookie
  async refreshToken(): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>(
      `/authentication/refresh-token`
    );
    return response.data;
  },

  // Token expiry check
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  // Setup interceptors for automatic token refresh
  setupInterceptors(logout: () => Promise<void>) {
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await this.refreshToken();
            if (response.success && response.data.accessToken) {
              localStorage.setItem("accessToken", response.data.accessToken);
              axiosInstance.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${response.data.accessToken}`;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            await logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  },
};
