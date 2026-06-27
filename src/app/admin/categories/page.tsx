"use client";

import { useState, useRef } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import CategoryList, {
  CategoryListRef,
} from "@/components/admin/categories/CategoryList";
import CategoryModal from "@/components/admin/categories/CategoryModal";
import { AdminCategory } from "@/types/admin-category.types";
import { Button, PageHeader } from "@/components/admin/ui";

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<AdminCategory | null>(null);
  const listRef = useRef<CategoryListRef>(null);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: AdminCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    listRef.current?.fetchCategories();
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Manage the categories that organize your products."
        actions={
          <Button
            onClick={handleAddCategory}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            Add Category
          </Button>
        }
      />

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
