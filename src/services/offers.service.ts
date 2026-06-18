import api from "@/lib/axios";
import {
  CreateOfferDto,
  UpdateOfferDto,
  OfferResponse,
  OffersResponse,
  OffersQuery,
} from "@/types/offer.types";

export const offersService = {
  async getOffers(query: OffersQuery = {}): Promise<OffersResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(query.page ?? 1));
      params.append("limit", String(query.limit ?? 10));
      if (query.offerType) {
        params.append("offerType", query.offerType);
      }
      if (query.isActive !== undefined && query.isActive !== "") {
        params.append("isActive", String(query.isActive));
      }

      const response = await api.get(`/admin/offers?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching offers:", error);
      throw error;
    }
  },

  async getOffer(offerId: string): Promise<OfferResponse> {
    try {
      const response = await api.get(`/admin/offers/${offerId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching offer:", error);
      throw error;
    }
  },

  async createOffer(offerData: CreateOfferDto): Promise<OfferResponse> {
    try {
      const response = await api.post("/admin/offers", offerData);
      return response.data;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  },

  async updateOffer(
    offerId: string,
    offerData: UpdateOfferDto
  ): Promise<OfferResponse> {
    try {
      const response = await api.put(`/admin/offers/${offerId}`, offerData);
      return response.data;
    } catch (error) {
      console.error("Error updating offer:", error);
      throw error;
    }
  },

  async toggleOffer(offerId: string): Promise<OfferResponse> {
    try {
      const response = await api.patch(`/admin/offers/${offerId}/toggle`);
      return response.data;
    } catch (error) {
      console.error("Error toggling offer:", error);
      throw error;
    }
  },

  async deleteOffer(offerId: string): Promise<void> {
    try {
      await api.delete(`/admin/offers/${offerId}`);
    } catch (error) {
      console.error("Error deleting offer:", error);
      throw error;
    }
  },
};
