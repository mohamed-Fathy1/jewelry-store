"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Size, CreateSizeDto } from "@/types/size.types";
import { sizesService } from "@/services/sizes.service";
import { Modal, Field, Button, adminInputClass } from "@/components/admin/ui";

interface SizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: Size | null;
  onSuccess?: () => void;
}

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
    <Modal
      open={isOpen}
      onClose={onClose}
      title={size ? "Edit Size" : "Add New Size"}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Number" htmlFor="size-number" required error={numberError}>
          <input
            id="size-number"
            type="text"
            value={formData.number}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, number: e.target.value }));
              if (numberError) setNumberError("");
            }}
            placeholder="Size label (e.g. 42)…"
            className={adminInputClass}
            required
          />
        </Field>

        <Field
          label="Order"
          htmlFor="size-order"
          required
          hint={isFetchingOrder ? "Loading…" : undefined}
        >
          <input
            id="size-order"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={formData.order}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, order: e.target.value }))
            }
            placeholder={isFetchingOrder ? "Loading…" : "Sort order (e.g. 3)…"}
            className={`${adminInputClass} tabular-nums`}
            disabled={isFetchingOrder}
            required
          />
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
