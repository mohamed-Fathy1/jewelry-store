"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import {
  AdminCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/types/admin-category.types";
import { Icon } from "@/types/icon.types";
import { categoriesService } from "@/services/categories.service";
import { iconsService } from "@/services/icons.service";
import { Modal, Field, Button, adminInputClass } from "@/components/admin/ui";
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
      className="h-5 w-5 flex-shrink-0 flex items-center justify-center text-admin-ink [&>svg]:h-full [&>svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left rounded-md border border-admin-hairline bg-admin-surface text-admin-ink flex items-center justify-between transition-colors hover:bg-admin-surface-muted"
      >
        <span className="flex items-center gap-2 min-w-0">
          {selected && <IconGlyph svg={selected.svg} />}
          <span className="truncate">
            {selected ? selected.key : "No icon"}
          </span>
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 flex-shrink-0 text-admin-ink-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 rounded-md border border-admin-hairline bg-admin-surface shadow-admin-popover max-h-60 overflow-auto">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2 text-left text-admin-ink transition-colors first:rounded-t-md flex items-center gap-2 hover:bg-admin-surface-muted ${
              value === "" ? "bg-admin-surface-muted" : ""
            }`}
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
              className={`w-full px-4 py-2 text-left text-admin-ink transition-colors last:rounded-b-md flex items-center gap-2 hover:bg-admin-surface-muted ${
                icon._id === value ? "bg-admin-surface-muted" : ""
              }`}
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
            <div className="mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.imageUrl}
                alt="Category"
                className="w-full h-32 object-cover rounded-md"
              />
            </div>
          )}
        </Field>

        {/* Icon */}
        <Field label="Icon">
          <IconSelect
            value={formData.iconId}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, iconId: value }))
            }
            icons={icons}
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
