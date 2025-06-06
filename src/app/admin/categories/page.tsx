"use client";

import { useState, useRef } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import CategoryList, {
  CategoryListRef,
} from "@/components/admin/categories/CategoryList";
import CategoryModal from "@/components/admin/categories/CategoryModal";
import { colors } from "@/constants/colors";

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const listRef = useRef<CategoryListRef>(null);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    listRef.current?.fetchCategories();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: colors.textPrimary }}
        >
          Categories
        </h1>
        <button
          onClick={handleAddCategory}
          className="flex items-center px-4 py-2 rounded-md text-white"
          style={{ backgroundColor: colors.brown }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Category
        </button>
      </div>

      <CategoryList ref={listRef} onEdit={handleEditCategory} />

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
