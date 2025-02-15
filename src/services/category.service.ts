import api from "@/lib/axios";
import {
  Category,
  CategoryResponse,
  CategoriesResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/types/category.types";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const categoryService = {
  async getAllCategories(): Promise<CategoriesResponse> {
    try {
      const response = await axiosInstance.get(
        "/public/category/get-all-categories"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  async getOneCategory(slug: string): Promise<CategoryResponse> {
    try {
      const response = await api.get(
        `/public/category/get-one-category/${slug}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },

  async createCategory(
    categoryData: CreateCategoryDto
  ): Promise<CategoryResponse> {
    try {
      const response = await api.post("/category/create", {
        categoryName: categoryData.categoryName,
        imageUrl: categoryData.image,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  async updateCategory(
    categoryId: string,
    categoryData: CreateCategoryDto
  ): Promise<CategoryResponse> {
    try {
      const response = await api.patch(`/category/update/${categoryId}`, {
        categoryName: categoryData.categoryName,
        imageUrl: categoryData.image,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await api.delete(`/category/delete/${categoryId}`);
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  async getCategoryProducts(
    categoryId: string,
    page: number = 1
  ): Promise<CategoryResponse> {
    try {
      const response = await api.get(
        `/category/${categoryId}/products?page=${page}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching category products:", error);
      throw error;
    }
  },
};
