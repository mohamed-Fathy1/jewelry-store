"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { PencilIcon, TrashIcon, SwatchIcon } from "@heroicons/react/24/outline";
import { Color } from "@/types/color.types";
import { colorsService } from "@/services/colors.service";
import { useDebounce } from "@/hooks/useDebounce";
import {
  TableShell,
  Thead,
  Tbody,
  Th,
  Td,
  Tr,
  IconButton,
  SearchInput,
  Pagination,
  SkeletonTable,
  EmptyState,
  ConfirmDialog,
} from "@/components/admin/ui";
import toast from "react-hot-toast";

interface ColorListProps {
  onEdit: (color: Color) => void;
}

export interface ColorListRef {
  fetchColors: () => Promise<void>;
}

const ColorList = forwardRef<ColorListRef, ColorListProps>(({ onEdit }, ref) => {
  const [colorsList, setColorsList] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Color | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchColors = async (
    page: number = currentPage,
    searchQuery: string = search
  ) => {
    setIsLoading(true);
    try {
      const response = await colorsService.getColors({
        page,
        search: searchQuery.trim() || undefined,
      });
      setColorsList(response.data.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch colors");
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchColors: () => fetchColors(currentPage),
  }));

  useEffect(() => {
    fetchColors(currentPage, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const debouncedSearch = useDebounce((value: string) => {
    setCurrentPage(1);
    fetchColors(1, value);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await colorsService.deleteColor(pendingDelete._id);
      toast.success("Color deleted successfully");
      setColorsList((prev) => prev.filter((c) => c._id !== pendingDelete._id));
      setPendingDelete(null);
    } catch (error) {
      toast.error("Failed to delete color");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search colors…"
          ariaLabel="Search colors"
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} cols={4} />
      ) : !colorsList || colorsList.length === 0 ? (
        <EmptyState
          icon={SwatchIcon}
          title="No colors found"
          description={
            search ? `No colors match “${search}”.` : "There are no colors yet. Add your first one."
          }
        />
      ) : (
        <>
          <TableShell>
            <Thead>
              <tr>
                <Th>Preview</Th>
                <Th>Name</Th>
                <Th>Hex Code</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {colorsList.map((color) => (
                <Tr key={color._id}>
                  <Td>
                    <span
                      className="inline-block h-8 w-8 rounded-full ring-1 ring-admin-hairline"
                      style={{ backgroundColor: color.hex }}
                      title={color.hex}
                    />
                  </Td>
                  <Td className="font-medium text-admin-ink">{color.name}</Td>
                  <Td className="tabular uppercase text-admin-ink-muted">{color.hex}</Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton
                        label={`Edit ${color.name}`}
                        icon={<PencilIcon />}
                        onClick={() => onEdit(color)}
                      />
                      <IconButton
                        label={`Delete ${color.name}`}
                        icon={<TrashIcon />}
                        variant="danger"
                        onClick={() => setPendingDelete(color)}
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
        title="Delete color"
        description={
          pendingDelete ? `“${pendingDelete.name}” will be permanently removed.` : ""
        }
        confirmLabel="Delete"
        danger
        loading={isDeleting}
      />
    </div>
  );
});

ColorList.displayName = "ColorList";
export default ColorList;
