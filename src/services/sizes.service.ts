import api from "@/lib/axios";
import {
  CreateSizeDto,
  UpdateSizeDto,
  SizeResponse,
  SizesResponse,
  SizesQuery,
} from "@/types/size.types";

export const sizesService = {
  async getSizes(query: SizesQuery = {}): Promise<SizesResponse> {
    try {
      const params = new URLSearchParams();
      if (query.page !== undefined) {
        params.append("page", String(query.page));
      }
      if (query.limit !== undefined) {
        params.append("limit", String(query.limit));
      }

      const qs = params.toString();
      const response = await api.get(`/admin/sizes${qs ? `?${qs}` : ""}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching sizes:", error);
      throw error;
    }
  },

  async getSize(sizeId: string): Promise<SizeResponse> {
    try {
      const response = await api.get(`/admin/sizes/${sizeId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching size:", error);
      throw error;
    }
  },

  async createSize(sizeData: CreateSizeDto): Promise<SizeResponse> {
    try {
      const response = await api.post("/admin/sizes", sizeData);
      return response.data;
    } catch (error) {
      console.error("Error creating size:", error);
      throw error;
    }
  },

  async updateSize(
    sizeId: string,
    sizeData: UpdateSizeDto
  ): Promise<SizeResponse> {
    try {
      const response = await api.put(`/admin/sizes/${sizeId}`, sizeData);
      return response.data;
    } catch (error) {
      console.error("Error updating size:", error);
      throw error;
    }
  },

  async deleteSize(sizeId: string): Promise<void> {
    try {
      await api.delete(`/admin/sizes/${sizeId}`);
    } catch (error) {
      console.error("Error deleting size:", error);
      throw error;
    }
  },
};
