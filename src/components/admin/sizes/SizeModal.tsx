"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { colors } from "@/constants/colors";
import { Size, CreateSizeDto } from "@/types/size.types";
import { sizesService } from "@/services/sizes.service";

interface SizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: Size | null;
  onSuccess?: () => void;
}

const inputClass =
  "mt-1 p-1 md:px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown";

export default function SizeModal({
  isOpen,
  onClose,
  size,
  onSuccess,
}: SizeModalProps) {
  const [formData, setFormData] = useState({ number: "", order: "" });
  const [numberError, setNumberError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingOrder, setIsFetchingOrder] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNumberError("");

    if (size) {
      setFormData({ number: size.number, order: String(size.order) });
      // Prefill from the full record (kept in sync with the rest of the app).
      sizesService
        .getSize(size._id)
        .then((res) => {
          if (res.data.size) {
            setFormData({
              number: res.data.size.number,
              order: String(res.data.size.order),
            });
          }
        })
        .catch(() => {
          /* keep the row data already populated */
        });
    } else {
      // Create: prefill the order with the next available value
      // (highest existing order + 1, or 1 when there are none yet).
      setFormData({ number: "", order: "" });
      setIsFetchingOrder(true);
      (async () => {
        try {
          // The Sizes list is paginated (page size 20) and sorted ascending by
          // `order`, so the highest order lives on the LAST page. Fetch page 1
          // to discover the page count, then read the last page for the true
          // maximum. (Note: the list endpoint only supports `page` — passing an
          // unsupported `limit` made the request fail and silently fall back to
          // 1, which is why the field always showed 1.)
          const firstPage = await sizesService.getSizes({ page: 1 });
          const totalPages = firstPage.data?.totalPages ?? 1;
          const items =
            totalPages > 1
              ? (await sizesService.getSizes({ page: totalPages })).data?.data ??
                []
              : firstPage.data?.data ?? [];
          const highestOrder = items.reduce(
            (max, item) => Math.max(max, Number(item.order) || 0),
            0
          );
          setFormData((prev) => ({ ...prev, order: String(highestOrder + 1) }));
        } catch {
          setFormData((prev) => ({ ...prev, order: "1" }));
        } finally {
          setIsFetchingOrder(false);
        }
      })();
    }
  }, [size, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNumberError("");

    const orderValue = Number(formData.order);
    if (!Number.isInteger(orderValue) || orderValue < 1) {
      toast.error("Order must be an integer of at least 1");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateSizeDto = {
        number: formData.number.trim(),
        order: orderValue,
      };

      if (size) {
        await sizesService.updateSize(size._id, payload);
        toast.success("Size updated successfully");
      } else {
        await sizesService.createSize(payload);
        toast.success("Size created successfully");
      }

      onClose();
      onSuccess?.();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setNumberError("This size number already exists");
      } else {
        toast.error(size ? "Failed to update size" : "Failed to create size");
      }
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
              {size ? "Edit Size" : "Add New Size"}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number
              </label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, number: e.target.value }));
                  if (numberError) setNumberError("");
                }}
                placeholder="Size label (e.g. 42)"
                className={inputClass}
                required
              />
              {numberError && (
                <p className="mt-1 text-sm text-red-600">{numberError}</p>
              )}
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Order
                {isFetchingOrder && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    Loading…
                  </span>
                )}
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, order: e.target.value }))
                }
                placeholder={isFetchingOrder ? "Loading…" : "Sort order (e.g. 3)"}
                className={inputClass}
                disabled={isFetchingOrder}
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
                {isSubmitting
                  ? "Saving..."
                  : size
                  ? "Update Size"
                  : "Create Size"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
