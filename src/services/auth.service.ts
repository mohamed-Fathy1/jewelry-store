import api from "@/lib/axios";
import axios from "axios";
import { AuthResponse } from "@/types/auth.types";

export const authService = {
  // Register with email
  async registerEmail(email: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
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
    const response = await api.post<AuthResponse>(
      `/authentication/active-account`,
      { email, activeCode }
    );
    console.log(response);

    return response.data;
  },

  // Logout user
  async logout(): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(`/user/logout`);
      return response.data;
    } catch (error) {
      // Even if logout fails on server, we should clear local storage
      console.error("Logout error:", error);
      return {
        success: true,
        message: "Logged out locally",
        statusCode: 200,
        data: {},
      };
    }
  },

  // Refresh token - uses HTTP-only cookie, no body needed
  async refreshToken(): Promise<AuthResponse> {
    try {
      // Create a new axios instance without interceptors to avoid infinite loops
      const refreshApi = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await refreshApi.post<AuthResponse>(
        `/authentication/refresh-token`,
        {} // Empty body since it uses HTTP-only cookies
      );
      return response.data;
    } catch (error) {
      console.error("Refresh token error:", error);
      throw error;
    }
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
    // Note: We don't need to set up response interceptors here anymore
    // since they're now handled in AuthContext
    return;
  },
};
