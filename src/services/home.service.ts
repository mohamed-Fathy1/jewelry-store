import axios from "axios";
import { HomeResponse } from "@/types/home.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Public, unauthed instance (matches product.service.ts). The /home endpoint
// needs no Bearer token, so we deliberately avoid src/lib/axios.ts.
const axiosInstance = axios.create({ baseURL: API_URL });

export const homeService = {
  // Aggregated homepage payload: best sellers, on-sale, and the active flash sale.
  async getHome(): Promise<HomeResponse> {
    const response = await axiosInstance.get<HomeResponse>("/home");
    return response.data;
  },
};
