"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import { Icon } from "@/types/icon.types";
import { iconsService } from "@/services/icons.service";
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

  const handleDelete = async (iconId: string) => {
    if (window.confirm("Are you sure you want to delete this icon?")) {
      try {
        await iconsService.deleteIcon(iconId);
        toast.success("Icon deleted successfully");
        setIcons((prev) => prev.filter((i) => i._id !== iconId));
      } catch (error) {
        toast.error("Failed to delete icon");
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!icons || icons.length === 0) {
    return (
      <div
        className="text-center py-12 px-4 border-2 border-dashed rounded-lg"
        style={{ borderColor: colors.border }}
      >
        <SparklesIcon
          className="mx-auto h-16 w-16 mb-4"
          style={{ color: colors.textSecondary }}
        />
        <h3
          className="text-lg font-medium mb-2"
          style={{ color: colors.textPrimary }}
        >
          No Icons Found
        </h3>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          There are no icons in the system yet.
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
                Preview
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Key
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Is Active
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
            {icons.map((icon) => (
              <tr key={icon._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="h-8 w-8 flex items-center justify-center text-gray-700 [&>svg]:h-full [&>svg]:w-full"
                    style={{ color: colors.textPrimary }}
                    dangerouslySetInnerHTML={{ __html: icon.svg }}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {icon.key}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      icon.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {icon.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(icon)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(icon._id)}
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

IconList.displayName = "IconList";
export default IconList;
