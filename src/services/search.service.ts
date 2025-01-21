import axios from "axios";
import { SearchResponse } from "@/types/search.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const searchService = {
  async searchProducts(
    query: string,
    page: number = 1
  ): Promise<SearchResponse> {
    const response = await axiosInstance.get<SearchResponse>(
      `/public/product/search?search=${query}&page=${page}`
    );
    return response.data;
  },
};
