import axios from "axios";
import {
  ProductsResponse,
  SingleProductResponse,
  ProductFilters,
} from "@/types/product.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const priceRange = {
  priceUnder100: "Under $100",
  priceBetween100and500: "$100 - $500",
  priceBetween500and1000: "$500 - $1000",
  priceAbove1000: "Above $1000",
} as const;

export const sort = {
  newest: "Newest",
  priceLowToHigh: "Low to High",
  priceHighToLow: "High to Low",
} as const;

export const productService = {
  // Get all products
  async getAllProducts(page: number = 1): Promise<ProductsResponse> {
    const response = await axiosInstance.get<ProductsResponse>(
      `/public/product/get-all-product?page=${page}`
    );
    return response.data;
  },

  // Get all sale products
  async getAllSaleProducts(page: number = 1): Promise<ProductsResponse> {
    const response = await axiosInstance.get<ProductsResponse>(
      `/public/product/get-all-sale?page=${page}`
    );
    return response.data;
  },

  // Get one product by ID
  async getOneProduct(id: string): Promise<SingleProductResponse> {
    const response = await axiosInstance.get<SingleProductResponse>(
      `/public/product/get-one-product/${id}`
    );
    return response.data;
  },

  // Get products by category
  async getProductsByCategory(
    categorySlug: string,
    page: number = 1
  ): Promise<ProductsResponse> {
    const response = await axiosInstance.get<ProductsResponse>(
      `/public/product/by-category/${categorySlug}?page=${page}`
    );
    return response.data;
  },

  // Sort products
  async getSortedProducts(
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc",
    page: number = 1
  ): Promise<ProductsResponse> {
    const response = await axiosInstance.get<ProductsResponse>(
      `/public/product/sort?sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}`
    );
    return response.data;
  },

  // Search products
  async searchProducts(query: string): Promise<ProductsResponse> {
    const response = await axiosInstance.get<ProductsResponse>(
      `/public/product/search-product?searchQuery=${query}`
    );
    return response.data;
  },

  // Filter and sort products
  async getFilteredProducts(
    filters: {
      priceRange?: (typeof priceRange)[keyof typeof priceRange];
      sort?: (typeof sort)[keyof typeof sort];
    },
    page: number = 1
  ): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();

    // Add page parameter
    if (page) {
      queryParams.append("page", page.toString());
    }

    // Add sort parameter
    if (filters.sort) {
      queryParams.append("sort", filters.sort);
    }

    // Add price range parameter
    if (filters.priceRange) {
      queryParams.append("priceRange", filters.priceRange);
    }

    const response = await axiosInstance.get<ProductsResponse>(
      `/public/product?${queryParams.toString()}`
    );
    return response.data;
  },

  // Sort products
  async getSortedProducts(
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc",
    page: number = 1
  ): Promise<ProductsResponse> {
    const response = await axiosInstance.get<ProductsResponse>(
      `/public/product/sort?sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}`
    );
    return response.data;
  },
};
