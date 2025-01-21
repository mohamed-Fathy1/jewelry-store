"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Product, ProductsResponse } from "@/types/product.types";
import { productService } from "@/services/product.service";
import toast from "react-hot-toast";

interface ProductContextType {
  products: Product[];
  saleProducts: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  getAllProducts: (page?: number) => Promise<void>;
  getAllSaleProducts: (page?: number) => Promise<void>;
  getOneProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const getAllProducts = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await productService.getAllProducts(page);
      if (response.success) {
        setProducts(response.data.products.data);
        setTotalPages(response.data.products.totalPages);
        setCurrentPage(response.data.products.currentPage);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllSaleProducts = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await productService.getAllSaleProducts(page);
      if (response.success) {
        setSaleProducts(response.data.products.data);
      }
    } catch (error) {
      toast.error("Failed to fetch sale products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOneProduct = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await productService.getOneProduct(id);
      if (response.success) {
        setCurrentProduct(response.data.product);
      }
    } catch (error) {
      toast.error("Failed to fetch product details");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    products,
    saleProducts,
    currentProduct,
    isLoading,
    totalPages,
    currentPage,
    getAllProducts,
    getAllSaleProducts,
    getOneProduct,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
}
