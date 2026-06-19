"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  PencilIcon,
  TrashIcon,
  ArchiveBoxXMarkIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { AdminCategory } from "@/types/admin-category.types";
import { categoriesService } from "@/services/categories.service";
import { iconsService } from "@/services/icons.service";
import {
  TableShell,
  Thead,
  Tbody,
  Th,
  Td,
  Tr,
  IconButton,
  SegmentedToggle,
  StatusBadge,
  SkeletonTable,
  EmptyState,
  ConfirmDialog,
} from "@/components/admin/ui";
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

    // Soft-delete confirmation (Active tab).
    const [pendingDelete, setPendingDelete] = useState<AdminCategory | null>(
      null
    );
    const [isDeleting, setIsDeleting] = useState(false);

    // Hard-delete (type-to-confirm) modal state, used on the Deleted tab.
    const [pendingHardDelete, setPendingHardDelete] =
      useState<AdminCategory | null>(null);
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

    const handleIsDeletedChange = (value: string) => {
      setIsDeleted(value as "false" | "true");
    };

    // icon_id may be a populated object (with svg), a raw id string, or null.
    const resolveIconSvg = (category: AdminCategory): string | null => {
      const icon = category.icon_id;
      if (!icon) return null;
      if (typeof icon === "object") return icon.svg || iconMap[icon._id] || null;
      return iconMap[icon] || null;
    };

    const confirmSoftDelete = async () => {
      if (!pendingDelete) return;
      setIsDeleting(true);
      try {
        await categoriesService.softDeleteCategory(pendingDelete._id);
        toast.success("Category deleted successfully");
        setCategories((prev) =>
          prev.map((c) =>
            c._id === pendingDelete._id ? { ...c, isDeleted: true } : c
          )
        );
        setPendingDelete(null);
      } catch (error) {
        toast.error("Failed to delete category");
      } finally {
        setIsDeleting(false);
      }
    };

    const confirmHardDelete = async () => {
      if (!pendingHardDelete) return;
      setIsHardDeleting(true);
      try {
        await categoriesService.hardDeleteCategory(pendingHardDelete._id);
        toast.success("Category permanently deleted");
        setCategories((prev) =>
          prev.filter((c) => c._id !== pendingHardDelete._id)
        );
        setPendingHardDelete(null);
      } catch (error) {
        toast.error("Failed to permanently delete category");
      } finally {
        setIsHardDeleting(false);
      }
    };

    const toggle = (
      <div className="mb-6">
        <SegmentedToggle
          value={isDeleted}
          onChange={handleIsDeletedChange}
          options={[
            { value: "false", label: "Active" },
            { value: "true", label: "Deleted" },
          ]}
        />
      </div>
    );

    return (
      <div>
        {toggle}

        {isLoading ? (
          <SkeletonTable rows={6} cols={6} />
        ) : !categories || categories.length === 0 ? (
          <EmptyState
            icon={FolderIcon}
            title="No categories found"
            description={
              isDeleted === "true"
                ? "There are no deleted categories."
                : "There are no categories in the system yet."
            }
          />
        ) : (
          <TableShell>
            <Thead>
              <tr>
                <Th>Image</Th>
                <Th>Category Name</Th>
                <Th>Slug</Th>
                <Th>Icon</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {categories.map((category) => {
                const iconSvg = resolveIconSvg(category);
                return (
                  <Tr key={category._id}>
                    <Td>
                      {category.image?.mediaUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={category.image.mediaUrl}
                          alt={category.categoryName}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded object-cover ring-1 ring-admin-hairline"
                        />
                      ) : (
                        <span className="text-sm text-admin-ink-subtle">—</span>
                      )}
                    </Td>
                    <Td className="font-medium text-admin-ink">
                      {category.categoryName}
                    </Td>
                    <Td className="text-admin-ink-muted">{category.slug}</Td>
                    <Td>
                      {iconSvg ? (
                        <span
                          className="grid h-9 w-9 place-items-center text-admin-ink [&>svg]:h-5 [&>svg]:w-5"
                          dangerouslySetInnerHTML={{ __html: iconSvg }}
                        />
                      ) : (
                        <span className="text-sm text-admin-ink-subtle">—</span>
                      )}
                    </Td>
                    <Td>
                      <StatusBadge
                        status={category.isDeleted ? "deleted" : "active"}
                      />
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          label={`Edit ${category.categoryName}`}
                          icon={<PencilIcon />}
                          onClick={() => onEdit(category)}
                        />
                        {isDeleted === "false" && (
                          <IconButton
                            label={`Delete ${category.categoryName}`}
                            icon={<ArchiveBoxXMarkIcon />}
                            variant="danger"
                            onClick={() => setPendingDelete(category)}
                          />
                        )}
                        {isDeleted === "true" && (
                          <IconButton
                            label={`Permanently delete ${category.categoryName}`}
                            icon={<TrashIcon />}
                            variant="danger"
                            onClick={() => setPendingHardDelete(category)}
                          />
                        )}
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </TableShell>
        )}

        <ConfirmDialog
          open={!!pendingDelete}
          onClose={() => setPendingDelete(null)}
          onConfirm={confirmSoftDelete}
          title="Delete category"
          description={
            pendingDelete
              ? `“${pendingDelete.categoryName}” will be marked as deleted but its products remain.`
              : ""
          }
          confirmLabel="Delete"
          danger
          loading={isDeleting}
        />

        <ConfirmDialog
          open={!!pendingHardDelete}
          onClose={() => setPendingHardDelete(null)}
          onConfirm={confirmHardDelete}
          title="Permanently delete category"
          description={
            pendingHardDelete
              ? `This will permanently delete “${pendingHardDelete.categoryName}” and ALL its products, variants, and images. This is irreversible.`
              : ""
          }
          confirmLabel="Delete Permanently"
          danger
          loading={isHardDeleting}
          requireText="delete"
        />
      </div>
    );
  }
);

CategoryList.displayName = "CategoryList";
export default CategoryList;
