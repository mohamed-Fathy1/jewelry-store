"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { colors } from "@/constants/colors";
import {
  AdminCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/types/admin-category.types";
import { Icon } from "@/types/icon.types";
import { categoriesService } from "@/services/categories.service";
import { iconsService } from "@/services/icons.service";
import ImageUpload from "../products/ImageUpload";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: AdminCategory | null;
  onSuccess?: () => void;
}

const inputClass =
  "mt-1 p-1 md:px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown";

// Resolve the current icon id from a category's icon_id, which may be a
// populated object, a raw id string, or null.
const resolveIconId = (category?: AdminCategory | null): string => {
  const icon = category?.icon_id;
  if (!icon) return "";
  return typeof icon === "object" ? icon._id : icon;
};

// Custom dropdown that renders each icon's SVG next to its key. Mirrors the
// shared Select component's styling since a native <select> cannot render SVG.
function IconSelect({
  value,
  onChange,
  icons,
}: {
  value: string;
  onChange: (value: string) => void;
  icons: Icon[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = icons.find((icon) => icon._id === value);

  const IconGlyph = ({ svg }: { svg: string }) => (
    <span
      className="h-5 w-5 flex-shrink-0 flex items-center justify-center [&>svg]:h-full [&>svg]:w-full"
      style={{ color: colors.textPrimary }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );

  return (
    <div className="relative mt-1" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left border rounded-md flex items-center justify-between transition-colors"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          color: colors.textPrimary,
        }}
      >
        <span className="flex items-center gap-2 min-w-0">
          {selected && <IconGlyph svg={selected.svg} />}
          <span className="truncate">
            {selected ? selected.key : "No icon"}
          </span>
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          style={{ color: colors.textSecondary }}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-10 w-full mt-1 border rounded-md shadow-lg max-h-60 overflow-auto"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left transition-colors first:rounded-t-md flex items-center gap-2"
            style={{
              color: colors.textPrimary,
              backgroundColor:
                value === "" ? `${colors.brown}15` : colors.background,
            }}
          >
            <span className="truncate">No icon</span>
          </button>
          {icons.map((icon) => (
            <button
              type="button"
              key={icon._id}
              onClick={() => {
                onChange(icon._id);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left transition-colors last:rounded-b-md flex items-center gap-2"
              style={{
                color: colors.textPrimary,
                backgroundColor:
                  icon._id === value ? `${colors.brown}15` : colors.background,
              }}
            >
              <IconGlyph svg={icon.svg} />
              <span className="truncate">{icon.key}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
        /* dropdown just shows "No icon" if icons can't be loaded */
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

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-md mx-auto p-6 max-h-[90vh] overflow-y-auto">
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
            {/* Category Name */}
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
                placeholder="Category Name"
                className={inputClass}
                required
              />
            </div>

            {/* Image (upload only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image
              </label>
              <ImageUpload folder="categories" onUpload={handleImageUpload} />

              {formData.imageUrl && (
                <div className="mt-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.imageUrl}
                    alt="Category"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Icon
              </label>
              <IconSelect
                value={formData.iconId}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, iconId: value }))
                }
                icons={icons}
              />
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
