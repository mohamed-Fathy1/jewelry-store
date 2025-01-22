import axios from "axios";
import { CategoriesResponse, CategoryResponse } from "@/types/category.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const categoryService = {
  async getAllCategories(): Promise<CategoriesResponse> {
    const response = await axiosInstance.get<CategoriesResponse>(
      `/public/category/get-all-categories`
    );
    return response.data;
  },

  async getOneCategory(slug: string): Promise<CategoryResponse> {
    const response = await axiosInstance.get<CategoryResponse>(
      `/public/category/get-one-category/${slug}`
    );
    return response.data;
  },
};
