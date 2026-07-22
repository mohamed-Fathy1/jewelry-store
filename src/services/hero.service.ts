import axios from "axios";
import { HeroResponse } from "@/types/hero.types";
import { HERO_FALLBACK, HeroImages, resolveHeroImages } from "./hero.resolve";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const heroService = {
  async getHeroImages(): Promise<HeroResponse> {
    const response = await axiosInstance.get<HeroResponse>(
      `/public/hero-section/get`
    );
    return response.data;
  },

  /**
   * Fetches and resolves the responsive hero image pair from the browser.
   * Used by the hero/banner components on mount so the admin-set images load
   * even when the server-side resolution fell back to the local defaults.
   * Never throws — returns the local fallbacks on any error.
   */
  async getResolvedHeroImages(): Promise<HeroImages> {
    try {
      const data = await this.getHeroImages();
      return resolveHeroImages(data);
    } catch {
      return HERO_FALLBACK;
    }
  },
};
