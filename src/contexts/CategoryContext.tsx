"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Category } from "@/types/category.types";
import { categoryService } from "@/services/category.service";
import toast from "react-hot-toast";

interface CategoryContextType {
  categories: Category[];
  currentCategory: Category | null;
  isLoading: boolean;
  getAllCategories: () => Promise<void>;
  getOneCategory: (slug: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAllCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await categoryService.getAllCategories();
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch {
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOneCategory = useCallback(async (slug: string) => {
    setIsLoading(true);
    try {
      const response = await categoryService.getOneCategory(slug);
      if (response.success) {
        setCurrentCategory(response.data.category);
      }
    } catch {
      toast.error("Failed to fetch category");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    categories,
    currentCategory,
    isLoading,
    getAllCategories,
    getOneCategory,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return context;
}
