"use client";

import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import { Shipping } from "@/types/shipping.types";
import { adminService } from "@/services/admin.service";
import toast from "react-hot-toast";
import { formatPrice } from "@/utils/format";

interface ShippingListProps {
  onEdit: (shipping: Shipping) => void;
}

export default function ShippingList({ onEdit }: ShippingListProps) {
  const [shippings, setShippings] = useState<Shipping[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShippings = async () => {
    try {
      const response = await adminService.getShippings();
      setShippings(response.data.shipping);
    } catch (error) {
      toast.error("Failed to fetch shipping options");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShippings();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this shipping option?")
    ) {
      try {
        await adminService.deleteShipping(id);
        toast.success("Shipping option deleted successfully");
        fetchShippings();
      } catch (error) {
        toast.error("Failed to delete shipping option");
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm w-full overflow-y-scroll">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Region
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cost
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {shippings.map((shipping) => (
            <tr key={shipping._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div
                  className="text-sm font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  {shipping.category}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div
                  className="text-sm font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  {formatPrice(shipping.cost)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(shipping)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(shipping._id)}
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
  );
}
