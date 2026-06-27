"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { PencilIcon, TrashIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Icon } from "@/types/icon.types";
import { iconsService } from "@/services/icons.service";
import {
  TableShell,
  Thead,
  Tbody,
  Th,
  Td,
  Tr,
  IconButton,
  Pagination,
  SkeletonTable,
  EmptyState,
  StatusBadge,
  ConfirmDialog,
} from "@/components/admin/ui";
import toast from "react-hot-toast";

interface IconListProps {
  onEdit: (icon: Icon) => void;
}

export interface IconListRef {
  fetchIcons: () => Promise<void>;
}

const IconList = forwardRef<IconListRef, IconListProps>(({ onEdit }, ref) => {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Icon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchIcons = async (page: number = currentPage) => {
    setIsLoading(true);
    try {
      const response = await iconsService.getIcons({ page });
      setIcons(response.data.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch icons");
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchIcons: () => fetchIcons(currentPage),
  }));

  useEffect(() => {
    fetchIcons(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await iconsService.deleteIcon(pendingDelete._id);
      toast.success("Icon deleted successfully");
      setIcons((prev) => prev.filter((i) => i._id !== pendingDelete._id));
      setPendingDelete(null);
    } catch (error) {
      toast.error("Failed to delete icon");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {isLoading ? (
        <SkeletonTable rows={6} cols={4} />
      ) : !icons || icons.length === 0 ? (
        <EmptyState
          icon={SparklesIcon}
          title="No icons found"
          description="There are no icons in the system yet. Add your first one."
        />
      ) : (
        <>
          <TableShell>
            <Thead>
              <tr>
                <Th>Preview</Th>
                <Th>Key</Th>
                <Th>Is Active</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {icons.map((icon) => (
                <Tr key={icon._id}>
                  <Td>
                    <span
                      className="grid h-9 w-9 place-items-center text-admin-ink [&>svg]:h-full [&>svg]:w-full"
                      dangerouslySetInnerHTML={{ __html: icon.svg }}
                    />
                  </Td>
                  <Td className="font-medium text-admin-ink">{icon.key}</Td>
                  <Td>
                    <StatusBadge
                      status={icon.isActive ? "active" : "inactive"}
                      label={icon.isActive ? "Active" : "Inactive"}
                    />
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton
                        label={`Edit ${icon.key}`}
                        icon={<PencilIcon />}
                        onClick={() => onEdit(icon)}
                      />
                      <IconButton
                        label={`Delete ${icon.key}`}
                        icon={<TrashIcon />}
                        variant="danger"
                        onClick={() => setPendingDelete(icon)}
                      />
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </TableShell>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete icon"
        description={
          pendingDelete ? `“${pendingDelete.key}” will be permanently removed.` : ""
        }
        confirmLabel="Delete"
        danger
        loading={isDeleting}
      />
    </div>
  );
});

IconList.displayName = "IconList";
export default IconList;
