"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  AdminCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/types/admin-category.types";
import { Icon } from "@/types/icon.types";
import { categoriesService } from "@/services/categories.service";
import { iconsService } from "@/services/icons.service";
import {
  Modal,
  Field,
  Button,
  Select,
  Thumbnail,
  adminInputClass,
  type SelectOption,
} from "@/components/admin/ui";
import ImageUpload from "../products/ImageUpload";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: AdminCategory | null;
  onSuccess?: () => void;
}

// Resolve the current icon id from a category's icon_id, which may be a
// populated object, a raw id string, or null.
const resolveIconId = (category?: AdminCategory | null): string => {
  const icon = category?.icon_id;
  if (!icon) return "";
  return typeof icon === "object" ? icon._id : icon;
};

export default function CategoryModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    categoryName: "",
    imageUrl: "",
    iconId: "",
  });
  const [icons, setIcons] = useState<Icon[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (category) {
      setFormData({
        categoryName: category.categoryName || "",
        imageUrl: category.image?.mediaUrl || "",
        iconId: resolveIconId(category),
      });
    } else {
      setFormData({ categoryName: "", imageUrl: "", iconId: "" });
    }
  }, [category, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // The icons endpoint only accepts `page`, so walk every page to gather all
    // icons for the dropdown.
    const loadAllIcons = async () => {
      try {
        const first = await iconsService.getIcons({ page: 1 });
        const all = [...(first.data.data || [])];
        const totalPages = first.data.totalPages || 1;

        for (let page = 2; page <= totalPages; page++) {
          const res = await iconsService.getIcons({ page });
          all.push(...(res.data.data || []));
        }

        setIcons(all);
      } catch (error) {
        /* dropdown just shows “No icon” if icons can't be loaded */
      }
    };

    loadAllIcons();
  }, [isOpen]);

  // The upload component returns the presigned-URL objects; persist the S3
  // mediaUrl of the first uploaded file.
  const handleImageUpload = (urls: any[]) => {
    if (urls.length > 0) {
      setFormData((prev) => ({ ...prev, imageUrl: urls[0].mediaUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      toast.error("Please upload a category image");
      return;
    }

    setIsSubmitting(true);

    try {
      if (category) {
        // Send only the fields that actually changed.
        const payload: UpdateCategoryDto = {};
        if (formData.categoryName !== category.categoryName) {
          payload.categoryName = formData.categoryName;
        }
        if (formData.imageUrl !== category.image?.mediaUrl) {
          payload.imageUrl = formData.imageUrl;
        }
        if (formData.iconId !== resolveIconId(category)) {
          payload.icon_id = formData.iconId || null;
        }

        if (Object.keys(payload).length === 0) {
          toast("No changes to update");
          onClose();
          return;
        }

        await categoriesService.updateCategory(category._id, payload);
        toast.success("Category updated successfully");
      } else {
        const payload: CreateCategoryDto = {
          categoryName: formData.categoryName,
          imageUrl: formData.imageUrl,
          icon_id: formData.iconId || null,
        };
        await categoriesService.createCategory(payload);
        toast.success("Category created successfully");
      }

      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(
        category ? "Failed to update category" : "Failed to create category"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // "No icon" sentinel + one option per icon, each showing its inline SVG glyph.
  const iconOptions: SelectOption[] = [
    { value: "", label: "No icon" },
    ...icons.map((icon) => ({
      value: icon._id,
      label: icon.key,
      glyph: icon.svg,
    })),
  ];

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={category ? "Edit Category" : "Add New Category"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Name */}
        <Field label="Category Name" htmlFor="category-name" required>
          <input
            id="category-name"
            type="text"
            value={formData.categoryName}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                categoryName: e.target.value,
              }))
            }
            placeholder="Category Name"
            className={adminInputClass}
            required
          />
        </Field>

        {/* Image (upload only) */}
        <Field label="Category Image">
          <ImageUpload folder="categories" onUpload={handleImageUpload} />

          {formData.imageUrl && (
            <Thumbnail
              src={formData.imageUrl}
              alt="Category"
              className="mt-4 h-52 w-full"
              fit="contain"
            />
          )}
        </Field>

        {/* Icon */}
        <Field label="Icon">
          <Select
            ariaLabel="Category icon"
            value={formData.iconId}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, iconId: value }))
            }
            placeholder="No icon"
            searchable
            options={iconOptions}
          />
        </Field>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {category ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
