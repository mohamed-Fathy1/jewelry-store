import axios from "axios";
import api from "@/lib/axios";
import {
  CreateOfferDto,
  UpdateOfferDto,
  Offer,
  OfferResponse,
  OffersResponse,
  OffersQuery,
} from "@/types/offer.types";

// Public, unauthed instance (mirrors home.service.ts). Used by the storefront
// promo banner so a non-2xx response can never trip the shared interceptor that
// clears a logged-in customer's token.
const publicApi = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

interface PublicOffersResponse {
  data: { offers: Offer[] };
}

export const offersService = {
  // Storefront-facing: fetch the live offers for the homepage promo banner from
  // the public endpoint. Returns [] on any failure so callers can fall back to
  // the default hero.
  async getActiveOffers(): Promise<Offer[]> {
    try {
      const response = await publicApi.get<PublicOffersResponse>(
        "/public/offers"
      );
      return response.data?.data?.offers ?? [];
    } catch {
      return [];
    }
  },

  async getOffers(query: OffersQuery = {}): Promise<OffersResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(query.page ?? 1));
      params.append("limit", String(query.limit ?? 10));
      if (query.offerType) {
        params.append("offerType", query.offerType);
      }
      if (query.search && query.search.trim()) {
        params.append("search", query.search.trim());
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
