"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { colors } from "@/constants/colors";
import { Icon, CreateIconDto } from "@/types/icon.types";
import { iconsService } from "@/services/icons.service";

interface IconModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: Icon | null;
  onSuccess?: () => void;
}

const inputClass =
  "mt-1 p-1 md:px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown";

export default function IconModal({
  isOpen,
  onClose,
  icon,
  onSuccess,
}: IconModalProps) {
  const [formData, setFormData] = useState({
    key: "",
    svg: "",
    isActive: true,
  });
  const [keyError, setKeyError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setKeyError("");
    setFormError("");

    if (icon) {
      setFormData({
        key: icon.key,
        svg: icon.svg,
        isActive: icon.isActive,
      });
      // Prefill from the full record (kept in sync with the rest of the app).
      iconsService
        .getIcon(icon._id)
        .then((res) => {
          if (res.data.icon) {
            setFormData({
              key: res.data.icon.key,
              svg: res.data.icon.svg,
              isActive: res.data.icon.isActive,
            });
          }
        })
        .catch((error: any) => {
          if (error?.response?.status === 404) {
            setFormError("This icon no longer exists.");
          }
          /* otherwise keep the row data already populated */
        });
    } else {
      setFormData({ key: "", svg: "", isActive: true });
    }
  }, [icon, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError("");
    setFormError("");
    setIsSubmitting(true);

    try {
      const payload: CreateIconDto = {
        key: formData.key.trim(),
        svg: formData.svg,
        isActive: formData.isActive,
      };

      if (icon) {
        await iconsService.updateIcon(icon._id, payload);
        toast.success("Icon updated successfully");
      } else {
        await iconsService.createIcon(payload);
        toast.success("Icon created successfully");
      }

      onClose();
      onSuccess?.();
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 409) {
        setKeyError("This icon key already exists");
      } else if (status === 404) {
        setFormError("This icon could not be found. It may have been deleted.");
      } else {
        toast.error(icon ? "Failed to update icon" : "Failed to create icon");
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

        <div className="relative bg-white rounded-lg w-full max-w-lg mx-auto p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title
              className="text-xl font-semibold"
              style={{ color: colors.textPrimary }}
            >
              {icon ? "Edit Icon" : "Add New Icon"}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {formError && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Key
              </label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, key: e.target.value }));
                  if (keyError) setKeyError("");
                }}
                placeholder="Unique key (e.g. facebook)"
                className={inputClass}
                required
              />
              {keyError && (
                <p className="mt-1 text-sm text-red-600">{keyError}</p>
              )}
            </div>

            {/* SVG */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                SVG Markup
              </label>
              <textarea
                value={formData.svg}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, svg: e.target.value }))
                }
                placeholder="<svg ...>...</svg>"
                rows={6}
                className={`${inputClass} font-mono text-xs`}
                required
              />
            </div>

            {/* Live preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div
                className="flex items-center justify-center h-24 rounded-md border border-gray-200 bg-gray-50"
                style={{ color: colors.textPrimary }}
              >
                {formData.svg.trim() ? (
                  <div
                    className="h-12 w-12 flex items-center justify-center [&>svg]:h-full [&>svg]:w-full"
                    dangerouslySetInnerHTML={{ __html: formData.svg }}
                  />
                ) : (
                  <span className="text-sm text-gray-400">
                    Paste SVG markup to preview
                  </span>
                )}
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Active
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={formData.isActive}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                style={{
                  backgroundColor: formData.isActive ? colors.brown : "#D1D5DB",
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
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
                  : icon
                  ? "Update Icon"
                  : "Create Icon"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
