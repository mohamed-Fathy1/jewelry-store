"use client";

import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { colors } from "@/constants/colors";
import { Category } from "@/types/category.types";
import { categoryService } from "@/services/category.service";
import toast from "react-hot-toast";

interface CategoryListProps {
  onEdit: (category: Category) => void;
}

export default function CategoryList({ onEdit }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.success) {
        setCategories(response.data.categories);
      }
      setIsLoading(false);
    } catch (error) {
      toast.error("Failed to fetch categories");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await categoryService.deleteCategory(categoryId);
        toast.success("Category deleted successfully");
        fetchCategories();
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <div
          key={category._id}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div className="relative h-48">
            <Image
              src={category.image.mediaUrl}
              alt={category.categoryName}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">
              {category.categoryName}
            </h3>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => onEdit(category)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(category._id)}
                className="text-red-600 hover:text-red-900"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
