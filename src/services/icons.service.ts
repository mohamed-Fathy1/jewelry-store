import api from "@/lib/axios";
import {
  CreateIconDto,
  UpdateIconDto,
  IconResponse,
  IconsResponse,
  IconsQuery,
} from "@/types/icon.types";

export const iconsService = {
  async getIcons(query: IconsQuery = {}): Promise<IconsResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(query.page ?? 1));

      const response = await api.get(`/admin/icons?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching icons:", error);
      throw error;
    }
  },

  async getIcon(iconId: string): Promise<IconResponse> {
    try {
      const response = await api.get(`/admin/icons/${iconId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching icon:", error);
      throw error;
    }
  },

  async createIcon(iconData: CreateIconDto): Promise<IconResponse> {
    try {
      const response = await api.post("/admin/icons", iconData);
      return response.data;
    } catch (error) {
      console.error("Error creating icon:", error);
      throw error;
    }
  },

  async updateIcon(
    iconId: string,
    iconData: UpdateIconDto
  ): Promise<IconResponse> {
    try {
      const response = await api.put(`/admin/icons/${iconId}`, iconData);
      return response.data;
    } catch (error) {
      console.error("Error updating icon:", error);
      throw error;
    }
  },

  async deleteIcon(iconId: string): Promise<void> {
    try {
      await api.delete(`/admin/icons/${iconId}`);
    } catch (error) {
      console.error("Error deleting icon:", error);
      throw error;
    }
  },
};
