import api from "@/lib/axios";
import {
  CategoriesResponse,
  CategoryResponse,
  HardDeleteResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/types/admin-category.types";

export const categoriesService = {
  // There is no admin list endpoint, so the list is sourced from the public
  // categories API.
  async getCategories(): Promise<CategoriesResponse> {
    try {
      const response = await api.get("/public/category/get-all-categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  async getDeletedCategories(): Promise<CategoriesResponse> {
    try {
      const response = await api.get("/admin/categories/deleted");
      return response.data;
    } catch (error) {
      console.error("Error fetching deleted categories:", error);
      throw error;
    }
  },

  async createCategory(
    categoryData: CreateCategoryDto
  ): Promise<CategoryResponse> {
    try {
      const response = await api.post("/admin/categories", categoryData);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  async updateCategory(
    categoryId: string,
    categoryData: UpdateCategoryDto
  ): Promise<CategoryResponse> {
    try {
      const response = await api.patch(
        `/admin/categories/${categoryId}`,
        categoryData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  async softDeleteCategory(categoryId: string): Promise<void> {
    try {
      await api.delete(`/admin/categories/${categoryId}`);
    } catch (error) {
      console.error("Error soft deleting category:", error);
      throw error;
    }
  },

  async hardDeleteCategory(categoryId: string): Promise<HardDeleteResponse> {
    try {
      const response = await api.delete(
        `/admin/categories/${categoryId}/hard`
      );
      return response.data;
    } catch (error) {
      console.error("Error hard deleting category:", error);
      throw error;
    }
  },
};
