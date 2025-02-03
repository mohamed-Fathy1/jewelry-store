import api from "@/lib/axios";
import { UserResponse } from "@/types/user.types";

export const userService = {
  async getUserInformation(): Promise<UserResponse> {
    const userStr = localStorage.getItem("authUser");
    if (userStr) {
      const response = await api.get<UserResponse>(`/user/user-information`);
      return response.data;
    }
    return {
      success: false,
      message: "User not found",
      statusCode: 404,
      data: null, // Added to satisfy UserResponse type
    };
  },

  async updateProfile(data: any): Promise<UserResponse> {
    const response = await api.patch<UserResponse>(
      `/user/update-user-information`,
      data
    );
    return response.data;
  },

  async addProfile(data: any): Promise<UserResponse> {
    const response = await api.post<UserResponse>(
      `/user/add-user-information`,
      data
    );
    return response.data;
  },

  async deleteUserInformation(id: string): Promise<UserResponse> {
    const response = await api.delete<UserResponse>(
      `/user/delete-user-information/${id}`
    );
    return response.data;
  },

  // Setup response interceptor for handling logout
  setupResponseInterceptor(logout: () => void) {
    // Note: We don't need this anymore as it's handled in AuthContext
    return;
  },
};
