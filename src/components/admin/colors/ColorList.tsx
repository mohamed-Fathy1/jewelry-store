"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import { Color } from "@/types/color.types";
import { colorsService } from "@/services/colors.service";
import { useDebounce } from "@/hooks/useDebounce";
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

  const handleDelete = async (colorId: string) => {
    if (window.confirm("Are you sure you want to delete this color?")) {
      try {
        await colorsService.deleteColor(colorId);
        toast.success("Color deleted successfully");
        setColorsList((prev) => prev.filter((c) => c._id !== colorId));
      } catch (error) {
        toast.error("Failed to delete color");
      }
    }
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search colors..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brown"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : !colorsList || colorsList.length === 0 ? (
        <div
          className="text-center py-12 px-4 border-2 border-dashed rounded-lg"
          style={{ borderColor: colors.border }}
        >
          <SwatchIcon
            className="mx-auto h-16 w-16 mb-4"
            style={{ color: colors.textSecondary }}
          />
          <h3
            className="text-lg font-medium mb-2"
            style={{ color: colors.textPrimary }}
          >
            No Colors Found
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {search
              ? `No colors match "${search}".`
              : "There are no colors in the system yet."}
          </p>
        </div>
      ) : (
        <>
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
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hex Code
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
                {colorsList.map((color) => (
                  <tr key={color._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-block h-8 w-8 rounded-full border border-gray-200"
                        style={{ backgroundColor: color.hex }}
                        title={color.hex}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {color.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 uppercase">
                        {color.hex}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onEdit(color)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(color._id)}
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 rounded-md text-sm"
              style={{
                backgroundColor:
                  currentPage === totalPages ? "#eee" : colors.brown,
                color: currentPage === totalPages ? "#666" : "white",
              }}
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </>
      )}
    </div>
  );
});

ColorList.displayName = "ColorList";
export default ColorList;
