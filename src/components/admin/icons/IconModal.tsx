"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Icon, CreateIconDto } from "@/types/icon.types";
import { iconsService } from "@/services/icons.service";
import { Modal, Field, Button, adminInputClass } from "@/components/admin/ui";

interface IconModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: Icon | null;
  onSuccess?: () => void;
}

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
    <Modal
      open={isOpen}
      onClose={onClose}
      title={icon ? "Edit Icon" : "Add New Icon"}
      size="md"
    >
      {formError && (
        <div className="mb-4 rounded-md border border-admin-danger/30 bg-admin-danger/10 px-4 py-2 text-sm text-admin-danger">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Key */}
        <Field label="Key" htmlFor="icon-key" required error={keyError}>
          <input
            id="icon-key"
            type="text"
            value={formData.key}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, key: e.target.value }));
              if (keyError) setKeyError("");
            }}
            placeholder="Unique key (e.g. facebook)"
            className={adminInputClass}
            required
          />
        </Field>

        {/* SVG */}
        <Field label="SVG Markup" htmlFor="icon-svg" required>
          <textarea
            id="icon-svg"
            value={formData.svg}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, svg: e.target.value }))
            }
            placeholder="<svg …>…</svg>"
            rows={6}
            className={`${adminInputClass} font-mono text-xs`}
            required
          />
        </Field>

        {/* Live preview */}
        <Field label="Preview">
          <div className="flex items-center justify-center h-24 rounded-md border border-admin-hairline bg-admin-surface-muted text-admin-ink">
            {formData.svg.trim() ? (
              <div
                className="h-12 w-12 flex items-center justify-center [&>svg]:h-full [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: formData.svg }}
              />
            ) : (
              <span className="text-sm text-admin-ink-subtle">
                Paste SVG markup to preview
              </span>
            )}
          </div>
        </Field>

        {/* Active toggle */}
        <div className="flex items-center justify-between">
          <label
            htmlFor="icon-active"
            className="block text-sm font-medium text-admin-ink"
          >
            Active
          </label>
          <button
            id="icon-active"
            type="button"
            role="switch"
            aria-checked={formData.isActive}
            onClick={() =>
              setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              formData.isActive ? "bg-admin-brown" : "bg-admin-hairline"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-admin-surface transition-transform ${
                formData.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {icon ? "Update Icon" : "Create Icon"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
