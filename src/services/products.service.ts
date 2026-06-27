import api from "@/lib/axios";
import {
  AdminProductsQuery,
  AdminProductsResponse,
  AdminProductResponse,
  ProductAnalysisResponse,
  CreateProductDto,
  UpdateProductDto,
} from "@/types/admin-product.types";

export const productsService = {
  async getAnalysis(): Promise<ProductAnalysisResponse> {
    try {
      const response = await api.get("/admin/products/analysis");
      return response.data;
    } catch (error) {
      console.error("Error fetching product analytics:", error);
      throw error;
    }
  },

  async getProducts(
    query: AdminProductsQuery = {}
  ): Promise<AdminProductsResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(query.page ?? 1));
      params.append("limit", String(query.limit ?? 20));
      if (query.search) params.append("search", query.search);
      if (query.category) params.append("category", query.category);
      if (query.isBestSeller) params.append("isBestSeller", query.isBestSeller);
      if (query.isDeleted) params.append("isDeleted", query.isDeleted);
      if (query.sort) params.append("sort", query.sort);
      if (query.color) params.append("color", query.color);
      if (query.size) params.append("size", query.size);
      if (query.minPrice !== undefined)
        params.append("minPrice", String(query.minPrice));
      if (query.maxPrice !== undefined)
        params.append("maxPrice", String(query.maxPrice));

      const response = await api.get(`/admin/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  async getProduct(productId: string): Promise<AdminProductResponse> {
    try {
      const response = await api.get(`/admin/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  async createProduct(
    productData: CreateProductDto
  ): Promise<AdminProductResponse> {
    try {
      const response = await api.post("/admin/products", productData);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  async updateProduct(
    productId: string,
    productData: UpdateProductDto
  ): Promise<AdminProductResponse> {
    try {
      const response = await api.put(
        `/admin/products/${productId}`,
        productData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  async softDeleteProduct(productId: string): Promise<void> {
    try {
      await api.delete(`/admin/products/${productId}`);
    } catch (error) {
      console.error("Error soft deleting product:", error);
      throw error;
    }
  },

  async hardDeleteProduct(productId: string): Promise<void> {
    try {
      await api.delete(`/admin/products/${productId}/hard`);
    } catch (error) {
      console.error("Error hard deleting product:", error);
      throw error;
    }
  },

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    try {
      await api.delete(
        `/admin/products/${productId}/variants/${variantId}`
      );
    } catch (error) {
      console.error("Error deleting variant:", error);
      throw error;
    }
  },
};
