"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Color, CreateColorDto } from "@/types/color.types";
import { colorsService } from "@/services/colors.service";
import { Modal, Field, Button, adminInputClass } from "@/components/admin/ui";

interface ColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  color?: Color | null;
  onSuccess?: () => void;
}

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
    <Modal
      open={isOpen}
      onClose={onClose}
      title={color ? "Edit Color" : "Add New Color"}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name" htmlFor="color-name" required error={nameError}>
          <input
            id="color-name"
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              if (nameError) setNameError("");
            }}
            placeholder="Color Name…"
            className={adminInputClass}
            required
          />
        </Field>

        <Field
          label="Hex Code"
          htmlFor="color-hex"
          required
          error={
            formData.hex && !isValidHex
              ? "Hex must match #RRGGBB or #RGB"
              : undefined
          }
        >
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={normalizeHex(formData.hex)}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, hex: e.target.value }))
              }
              className="h-10 w-10 flex-shrink-0 cursor-pointer rounded-md border border-admin-hairline p-0"
              title="Pick a color"
              aria-label="Pick a color"
            />
            <input
              id="color-hex"
              type="text"
              value={formData.hex}
              onChange={(e) => {
                // Allow typing a hex manually; normalise to a leading "#"
                // and keep only hex digits so it stays in sync with the picker.
                let next = e.target.value.trim();
                if (next && !next.startsWith("#")) next = `#${next}`;
                next = next.replace(/[^#0-9A-Fa-f]/g, "").slice(0, 7);
                setFormData((prev) => ({ ...prev, hex: next }));
              }}
              placeholder="#RRGGBB"
              maxLength={7}
              className={`${adminInputClass} uppercase tabular-nums`}
            />
          </div>
        </Field>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
