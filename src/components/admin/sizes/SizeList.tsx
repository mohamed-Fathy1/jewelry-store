"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { PencilIcon, TrashIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { Size } from "@/types/size.types";
import { sizesService } from "@/services/sizes.service";
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
  ConfirmDialog,
} from "@/components/admin/ui";
import toast from "react-hot-toast";

interface SizeListProps {
  onEdit: (size: Size) => void;
}

export interface SizeListRef {
  fetchSizes: () => Promise<void>;
}

const SizeList = forwardRef<SizeListRef, SizeListProps>(({ onEdit }, ref) => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Size | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSizes = async (page: number = currentPage) => {
    setIsLoading(true);
    try {
      const response = await sizesService.getSizes({ page });
      setSizes(response.data.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch sizes");
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchSizes: () => fetchSizes(currentPage),
  }));

  useEffect(() => {
    fetchSizes(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await sizesService.deleteSize(pendingDelete._id);
      toast.success("Size deleted successfully");
      setSizes((prev) => prev.filter((s) => s._id !== pendingDelete._id));
      setPendingDelete(null);
    } catch (error) {
      toast.error("Failed to delete size");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {isLoading ? (
        <SkeletonTable rows={6} cols={3} />
      ) : !sizes || sizes.length === 0 ? (
        <EmptyState
          icon={Squares2X2Icon}
          title="No sizes found"
          description="There are no sizes in the system yet. Add your first one."
        />
      ) : (
        <>
          <TableShell>
            <Thead>
              <tr>
                <Th>Number</Th>
                <Th>Order</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {sizes.map((size) => (
                <Tr key={size._id}>
                  <Td className="tabular font-medium text-admin-ink">{size.number}</Td>
                  <Td className="tabular text-admin-ink-muted">{size.order}</Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton
                        label={`Edit ${size.number}`}
                        icon={<PencilIcon />}
                        onClick={() => onEdit(size)}
                      />
                      <IconButton
                        label={`Delete ${size.number}`}
                        icon={<TrashIcon />}
                        variant="danger"
                        onClick={() => setPendingDelete(size)}
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
        title="Delete size"
        description={
          pendingDelete ? `“${pendingDelete.number}” will be permanently removed.` : ""
        }
        confirmLabel="Delete"
        danger
        loading={isDeleting}
      />
    </div>
  );
});

SizeList.displayName = "SizeList";
export default SizeList;
