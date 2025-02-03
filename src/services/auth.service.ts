import api from "@/lib/axios";
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
    return response.data;
  },

  // Logout user
  async logout(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`/user/logout`);
    return response.data;
  },

  // Refresh token - no email needed as it uses HTTP-only cookie
  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
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
    // Note: We don't need to set up response interceptors here anymore
    // since they're now handled in AuthContext
    return;
  },
};
