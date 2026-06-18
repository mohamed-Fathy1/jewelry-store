import api from "@/lib/axios";
import {
  CreateColorDto,
  UpdateColorDto,
  ColorResponse,
  ColorsResponse,
  ColorsQuery,
} from "@/types/color.types";

export const colorsService = {
  async getColors(query: ColorsQuery = {}): Promise<ColorsResponse> {
    try {
      const params = new URLSearchParams();
      if (query.page !== undefined) {
        params.append("page", String(query.page));
      }
      if (query.search) {
        params.append("search", query.search);
      }

      const qs = params.toString();
      const response = await api.get(`/admin/colors${qs ? `?${qs}` : ""}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching colors:", error);
      throw error;
    }
  },

  async getColor(colorId: string): Promise<ColorResponse> {
    try {
      const response = await api.get(`/admin/colors/${colorId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching color:", error);
      throw error;
    }
  },

  async createColor(colorData: CreateColorDto): Promise<ColorResponse> {
    try {
      const response = await api.post("/admin/colors", colorData);
      return response.data;
    } catch (error) {
      console.error("Error creating color:", error);
      throw error;
    }
  },

  async updateColor(
    colorId: string,
    colorData: UpdateColorDto
  ): Promise<ColorResponse> {
    try {
      const response = await api.put(`/admin/colors/${colorId}`, colorData);
      return response.data;
    } catch (error) {
      console.error("Error updating color:", error);
      throw error;
    }
  },

  async deleteColor(colorId: string): Promise<void> {
    try {
      await api.delete(`/admin/colors/${colorId}`);
    } catch (error) {
      console.error("Error deleting color:", error);
      throw error;
    }
  },
};
