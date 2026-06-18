"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import { Size } from "@/types/size.types";
import { sizesService } from "@/services/sizes.service";
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

  const handleDelete = async (sizeId: string) => {
    if (window.confirm("Are you sure you want to delete this size?")) {
      try {
        await sizesService.deleteSize(sizeId);
        toast.success("Size deleted successfully");
        setSizes((prev) => prev.filter((s) => s._id !== sizeId));
      } catch (error) {
        toast.error("Failed to delete size");
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!sizes || sizes.length === 0) {
    return (
      <div
        className="text-center py-12 px-4 border-2 border-dashed rounded-lg"
        style={{ borderColor: colors.border }}
      >
        <Squares2X2Icon
          className="mx-auto h-16 w-16 mb-4"
          style={{ color: colors.textSecondary }}
        />
        <h3
          className="text-lg font-medium mb-2"
          style={{ color: colors.textPrimary }}
        >
          No Sizes Found
        </h3>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          There are no sizes in the system yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto min-h-[40vh]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Number
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Order
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
            {sizes.map((size) => (
              <tr key={size._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {size.number}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{size.order}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(size)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(size._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center my-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center px-3 py-2 rounded-md text-sm"
          style={{
            backgroundColor: currentPage === 1 ? "#eee" : colors.brown,
            color: currentPage === 1 ? "#666" : "white",
          }}
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center px-3 py-2 rounded-md text-sm"
          style={{
            backgroundColor: currentPage === totalPages ? "#eee" : colors.brown,
            color: currentPage === totalPages ? "#666" : "white",
          }}
        >
          Next
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
});

SizeList.displayName = "SizeList";
export default SizeList;
