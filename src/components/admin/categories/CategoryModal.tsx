"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Category, CreateCategoryDto } from "@/types/category.types";
import { categoryService } from "@/services/category.service";
import toast from "react-hot-toast";
import { colors } from "@/constants/colors";
import ImageUpload from "../products/ImageUpload";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
}

export default function CategoryModal({
  isOpen,
  onClose,
  category,
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    categoryName: "",
    image: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        categoryName: category.categoryName,
        image: category.image.mediaUrl,
      });
    } else {
      setFormData({
        categoryName: "",
        image: "",
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const categoryData: CreateCategoryDto = {
        categoryName: formData.categoryName,
        image: formData.image,
      };

      if (category) {
        await categoryService.updateCategory(category._id, categoryData);
        toast.success("Category updated successfully");
      } else {
        await categoryService.createCategory(categoryData);
        toast.success("Category created successfully");
      }

      onClose();
    } catch (error) {
      toast.error(
        category ? "Failed to update category" : "Failed to create category"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData((prev) => ({
        ...prev,
        image: urls[0],
      }));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-md mx-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title
              className="text-xl font-semibold"
              style={{ color: colors.textPrimary }}
            >
              {category ? "Edit Category" : "Add New Category"}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category Name
              </label>
              <input
                type="text"
                value={formData.categoryName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryName: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image
              </label>
              <ImageUpload onUpload={handleImageUpload} />

              {formData.image && (
                <div className="mt-4">
                  <img
                    src={formData.image}
                    alt="Category"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: colors.brown }}
              >
                {isSubmitting
                  ? "Saving..."
                  : category
                  ? "Update Category"
                  : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
