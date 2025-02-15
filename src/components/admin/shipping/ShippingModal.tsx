"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Shipping } from "@/types/shipping.types";
import { adminService } from "@/services/admin.service";
import toast from "react-hot-toast";
import { colors } from "@/constants/colors";

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipping?: Shipping | null;
}

const AVAILABLE_REGIONS = [
  "Cairo&Giza",
  "Delta Region",
  "Upper Egypt",
] as const;

export default function ShippingModal({
  isOpen,
  onClose,
  shipping,
}: ShippingModalProps) {
  const [formData, setFormData] = useState({
    category: "",
    cost: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (shipping) {
      setFormData({
        category: shipping.category,
        cost: shipping.cost.toString(),
      });
    } else {
      setFormData({
        category: "",
        cost: "",
      });
    }
  }, [shipping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        category: formData.category,
        cost: parseFloat(formData.cost),
      };

      if (shipping) {
        await adminService.updateShipping(shipping._id, data);
        toast.success("Shipping option updated successfully");
      } else {
        await adminService.createShipping(data);
        toast.success("Shipping option created successfully");
      }

      onClose();
      // Refresh the list
      window.location.reload();
    } catch (error) {
      toast.error(
        shipping
          ? "Failed to update shipping option"
          : "Failed to create shipping option"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
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
              {shipping ? "Edit Shipping Option" : "Add New Shipping Option"}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Region
              </label>
              {shipping ? (
                // If editing, show readonly region
                <input
                  type="text"
                  value={formData.category}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 cursor-not-allowed"
                  disabled
                />
              ) : (
                // If creating new, show region selector
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown"
                  required
                >
                  <option value="">Select a region</option>
                  {AVAILABLE_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cost (EGP)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cost: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: colors.brown }}
              >
                {isSubmitting ? "Saving..." : shipping ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
