import axios from "axios";
import { HeroResponse } from "@/types/hero.types";

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
};
