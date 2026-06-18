"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  PencilIcon,
  TrashIcon,
  ArchiveBoxXMarkIcon,
  FolderIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { colors } from "@/constants/colors";
import { AdminCategory } from "@/types/admin-category.types";
import { categoriesService } from "@/services/categories.service";
import { iconsService } from "@/services/icons.service";
import toast from "react-hot-toast";

interface CategoryListProps {
  onEdit: (category: AdminCategory) => void;
}

export interface CategoryListRef {
  fetchCategories: () => Promise<void>;
}

const CategoryList = forwardRef<CategoryListRef, CategoryListProps>(
  ({ onEdit }, ref) => {
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [iconMap, setIconMap] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    // Active categories by default (isDeleted=false).
    const [isDeleted, setIsDeleted] = useState<"false" | "true">("false");

    // Hard-delete (type-to-confirm) modal state, used on the Deleted tab.
    const [hardDeleteTarget, setHardDeleteTarget] =
      useState<AdminCategory | null>(null);
    const [confirmText, setConfirmText] = useState("");
    const [isHardDeleting, setIsHardDeleting] = useState(false);

    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response =
          isDeleted === "true"
            ? await categoriesService.getDeletedCategories()
            : await categoriesService.getCategories();
        setCategories(response.data.categories || []);
      } catch (error) {
        toast.error("Failed to fetch categories");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchIcons = async () => {
      try {
        // The icons endpoint only accepts `page`, so walk every page to map
        // each icon id to its svg for inline rendering.
        const map: Record<string, string> = {};
        const first = await iconsService.getIcons({ page: 1 });
        const totalPages = first.data.totalPages || 1;
        const addIcons = (icons: typeof first.data.data) =>
          (icons || []).forEach((icon) => {
            map[icon._id] = icon.svg;
          });

        addIcons(first.data.data);
        for (let page = 2; page <= totalPages; page++) {
          const res = await iconsService.getIcons({ page });
          addIcons(res.data.data);
        }

        setIconMap(map);
      } catch (error) {
        // Non-fatal: icons just won't render inline, the list still works.
      }
    };

    useImperativeHandle(ref, () => ({
      fetchCategories,
    }));

    useEffect(() => {
      fetchCategories();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDeleted]);

    useEffect(() => {
      fetchIcons();
    }, []);

    const handleIsDeletedChange = (value: "false" | "true") => {
      setIsDeleted(value);
    };

    // icon_id may be a populated object (with svg), a raw id string, or null.
    const resolveIconSvg = (category: AdminCategory): string | null => {
      const icon = category.icon_id;
      if (!icon) return null;
      if (typeof icon === "object") return icon.svg || iconMap[icon._id] || null;
      return iconMap[icon] || null;
    };

    const handleSoftDelete = async (category: AdminCategory) => {
      if (
        !window.confirm(
          `Soft delete "${category.categoryName}"? It will be marked as deleted but its products remain.`
        )
      ) {
        return;
      }
      try {
        await categoriesService.softDeleteCategory(category._id);
        toast.success("Category deleted successfully");
        setCategories((prev) =>
          prev.map((c) =>
            c._id === category._id ? { ...c, isDeleted: true } : c
          )
        );
      } catch (error) {
        toast.error("Failed to delete category");
      }
    };

    const handleHardDelete = async (category: AdminCategory) => {
      if (
        !window.confirm(
          `This will permanently delete "${category.categoryName}" and ALL its products, variants, and images. This is irreversible.\n\nAre you sure you want to continue?`
        )
      ) {
        return;
      }
      try {
        const response = await categoriesService.hardDeleteCategory(
          category._id
        );
        const { deletedProducts, deletedVariants } = response.data || {};
        toast.success(
          `Category permanently deleted (${deletedProducts ?? 0} products, ${
            deletedVariants ?? 0
          } variants)`
        );
        setCategories((prev) => prev.filter((c) => c._id !== category._id));
      } catch (error) {
        toast.error("Failed to permanently delete category");
      }
    };

    // Deleted tab uses a type-to-confirm modal instead of window.confirm.
    const openHardDelete = (category: AdminCategory) => {
      setHardDeleteTarget(category);
      setConfirmText("");
    };

    const closeHardDelete = () => {
      setHardDeleteTarget(null);
      setConfirmText("");
    };

    const confirmHardDelete = async () => {
      if (!hardDeleteTarget || confirmText !== "delete") return;
      setIsHardDeleting(true);
      try {
        await categoriesService.hardDeleteCategory(hardDeleteTarget._id);
        toast.success("Category permanently deleted");
        setCategories((prev) =>
          prev.filter((c) => c._id !== hardDeleteTarget._id)
        );
        closeHardDelete();
      } catch (error) {
        toast.error("Failed to permanently delete category");
      } finally {
        setIsHardDeleting(false);
      }
    };

    // Active / Deleted toggle copied from the products page.
    const Toggle = (
      <div className="mb-6">
        <div
          className="inline-flex items-center rounded-lg p-1"
          style={{ backgroundColor: colors.accentLight }}
        >
          {(
            [
              { value: "false", label: "Active" },
              { value: "true", label: "Deleted" },
            ] as const
          ).map((option) => {
            const active = isDeleted === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleIsDeletedChange(option.value)}
                className="px-5 py-1.5 rounded-md text-sm font-medium transition-colors"
                style={
                  active
                    ? { backgroundColor: colors.brown, color: "white" }
                    : {
                        backgroundColor: "transparent",
                        color: colors.textSecondary,
                      }
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );

    // Hard delete confirmation (type-to-confirm), used on the Deleted tab.
    const HardDeleteDialog = (
      <Dialog
        open={!!hardDeleteTarget}
        onClose={closeHardDelete}
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
                Hard Delete Category
              </Dialog.Title>
              <button
                onClick={closeHardDelete}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">
                This will permanently delete the category and ALL its products,
                variants, and images. This is irreversible.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              Type{" "}
              <span className="font-semibold text-gray-900">delete</span> to
              confirm.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete"
              autoFocus
              className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown mb-4"
            />

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeHardDelete}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmHardDelete}
                disabled={confirmText !== "delete" || isHardDeleting}
                className="px-4 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#B91C1C" }}
              >
                {isHardDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    );

    if (isLoading) {
      return (
        <div>
          {Toggle}
          <div>Loading...</div>
        </div>
      );
    }

    if (!categories || categories.length === 0) {
      return (
        <div>
          {Toggle}
          <div
            className="text-center py-12 px-4 border-2 border-dashed rounded-lg"
            style={{ borderColor: colors.border }}
          >
            <FolderIcon
              className="mx-auto h-16 w-16 mb-4"
              style={{ color: colors.textSecondary }}
            />
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: colors.textPrimary }}
            >
              No Categories Found
            </h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {isDeleted === "true"
                ? "There are no deleted categories."
                : "There are no categories in the system yet."}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div>
        {Toggle}
        <div className="overflow-x-auto min-h-[40vh]">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Image
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Slug
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Icon
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Is Deleted
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => {
              const iconSvg = resolveIconSvg(category);
              return (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.image?.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={category.image.mediaUrl}
                        alt={category.categoryName}
                        className="h-10 w-10 rounded object-cover border border-gray-200"
                      />
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {category.categoryName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{category.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {iconSvg ? (
                      <div
                        className="h-8 w-8 flex items-center justify-center [&>svg]:h-full [&>svg]:w-full"
                        style={{ color: colors.textPrimary }}
                        dangerouslySetInnerHTML={{ __html: iconSvg }}
                      />
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.isDeleted
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {category.isDeleted ? "Deleted" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(category)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    {isDeleted === "false" && (
                      <button
                        onClick={() => handleSoftDelete(category)}
                        className="text-yellow-600 hover:text-yellow-800 mr-4"
                        title="Soft delete"
                      >
                        <ArchiveBoxXMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                    {isDeleted === "true" && (
                      <button
                        onClick={() =>
                          isDeleted === "true"
                            ? openHardDelete(category)
                            : handleHardDelete(category)
                        }
                        className="text-red-600 hover:text-red-900"
                        title="Hard delete (permanent)"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {HardDeleteDialog}
      </div>
    );
  }
);

CategoryList.displayName = "CategoryList";
export default CategoryList;
