"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { colors } from "@/constants/colors";
import { Color, CreateColorDto } from "@/types/color.types";
import { colorsService } from "@/services/colors.service";

interface ColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  color?: Color | null;
  onSuccess?: () => void;
}

const inputClass =
  "mt-1 p-1 md:px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown";

// Matches the server's accepted hex formats: #RRGGBB or #RGB.
const HEX_PATTERN = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

// Native <input type="color"> only accepts #RRGGBB, so expand #RGB and
// fall back to black for empty/invalid values.
const normalizeHex = (hex: string): string => {
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;
  if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
    const [, r, g, b] = hex;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#000000";
};

export default function ColorModal({
  isOpen,
  onClose,
  color,
  onSuccess,
}: ColorModalProps) {
  const [formData, setFormData] = useState({ name: "", hex: "" });
  const [nameError, setNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNameError("");

    if (color) {
      setFormData({ name: color.name, hex: color.hex });
      // Prefill from the full record (kept in sync with the rest of the app).
      colorsService
        .getColor(color._id)
        .then((res) => {
          if (res.data.color) {
            setFormData({
              name: res.data.color.name,
              hex: res.data.color.hex,
            });
          }
        })
        .catch(() => {
          /* keep the row data already populated */
        });
    } else {
      setFormData({ name: "", hex: "" });
    }
  }, [color, isOpen]);

  const isValidHex = HEX_PATTERN.test(formData.hex);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");

    if (!isValidHex) {
      toast.error("Hex must match #RRGGBB or #RGB");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateColorDto = {
        name: formData.name.trim(),
        hex: formData.hex,
      };

      if (color) {
        await colorsService.updateColor(color._id, payload);
        toast.success("Color updated successfully");
      } else {
        await colorsService.createColor(payload);
        toast.success("Color created successfully");
      }

      onClose();
      onSuccess?.();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setNameError("This color name already exists");
      } else {
        toast.error(
          color ? "Failed to update color" : "Failed to create color"
        );
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
              {color ? "Edit Color" : "Add New Color"}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (nameError) setNameError("");
                }}
                placeholder="Color Name"
                className={inputClass}
                required
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600">{nameError}</p>
              )}
            </div>

            {/* Hex */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hex Code
              </label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="color"
                  value={normalizeHex(formData.hex)}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, hex: e.target.value }))
                  }
                  className="h-10 w-10 flex-shrink-0 rounded-md border border-gray-200 cursor-pointer p-0"
                  title="Pick a color"
                />
                <input
                  type="text"
                  value={formData.hex}
                  readOnly
                  placeholder="#RRGGBB"
                  className="p-1 md:px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown bg-gray-50 uppercase"
                />
              </div>
              {formData.hex && !isValidHex && (
                <p className="mt-1 text-sm text-red-600">
                  Hex must match #RRGGBB or #RGB
                </p>
              )}
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
                  : color
                  ? "Update Color"
                  : "Create Color"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
