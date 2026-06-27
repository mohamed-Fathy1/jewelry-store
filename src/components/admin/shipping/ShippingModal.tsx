"use client";

import { useState, useEffect } from "react";
import { Shipping } from "@/types/shipping.types";
import { adminService } from "@/services/admin.service";
import toast from "react-hot-toast";
import { Modal, Field, Button, adminInputClass } from "@/components/admin/ui";

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
    <Modal
      open={isOpen}
      onClose={onClose}
      title={shipping ? "Edit Shipping Option" : "Add New Shipping Option"}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Region Name" htmlFor="shipping-category">
          <input
            id="shipping-category"
            type="text"
            value={formData.category}
            className={adminInputClass}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
            placeholder="Region…"
          />
        </Field>

        <Field label="Cost (EGP)" htmlFor="shipping-cost" required>
          <input
            id="shipping-cost"
            type="number"
            inputMode="decimal"
            step="0.01"
            value={formData.cost}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, cost: e.target.value }))
            }
            placeholder="Cost…"
            className={`${adminInputClass} tabular-nums`}
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
