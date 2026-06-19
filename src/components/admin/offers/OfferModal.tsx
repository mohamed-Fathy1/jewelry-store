"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Offer, OfferType, CreateOfferDto } from "@/types/offer.types";
import { offersService } from "@/services/offers.service";
import { OFFER_TYPE_LABELS } from "./OfferList";
import ImageUpload from "../products/ImageUpload";
import { Modal, Field, Button, Thumbnail, adminInputClass } from "@/components/admin/ui";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer?: Offer | null;
  onSuccess?: () => void;
}

// Which conditional fields each offer type requires.
const FIELD_CONFIG: Record<
  OfferType,
  {
    minQuantity?: boolean;
    minAmount?: boolean;
    discountPercentage?: boolean;
    freeItemMaxValue?: boolean;
    excludedCategories?: boolean;
    timing?: boolean;
    targetProducts?: boolean;
  }
> = {
  buy_x_get_cheapest_free: { minQuantity: true },
  spend_x_get_discount: { minAmount: true, discountPercentage: true },
  spend_x_get_free_shipping: { minAmount: true },
  buy_x_get_free_shipping: { minQuantity: true, excludedCategories: true },
  buy_x_get_half_price: { minQuantity: true },
  spend_x_get_free_item: { minAmount: true, freeItemMaxValue: true },
  flash_sale: {
    timing: true,
    discountPercentage: true,
    targetProducts: true,
  },
};

const OFFER_TYPES = Object.keys(OFFER_TYPE_LABELS) as OfferType[];

const emptyForm = {
  title: "",
  description: "",
  isActive: true,
  imageUrl: "",
  offerType: "" as OfferType | "",
  minQuantity: "",
  minAmount: "",
  discountPercentage: "",
  freeItemMaxValue: "",
  excludedCategories: "",
  targetProducts: "",
  startDate: "",
  endDate: "",
};

type FormState = typeof emptyForm;

// "665e…,665f…" <-> array of ids (objects are populated on GET).
const parseIds = (value: string): string[] =>
  value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

const idsToString = (items?: any[]): string =>
  (items || [])
    .map((item) => (typeof item === "object" && item ? item._id : item))
    .filter(Boolean)
    .join(", ");

const isoToLocalInput = (iso?: string | null): string =>
  iso ? format(new Date(iso), "yyyy-MM-dd'T'HH:mm") : "";

const localInputToIso = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;

export default function OfferModal({
  isOpen,
  onClose,
  offer,
  onSuccess,
}: OfferModalProps) {
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (offer) {
      // Prefill from the full offer (fetch to get populated/complete data).
      const populate = (data: Offer) => {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          isActive: data.isActive ?? true,
          imageUrl: data.image?.mediaUrl || "",
          offerType: data.offerType || "",
          minQuantity:
            data.condition?.minQuantity != null
              ? String(data.condition.minQuantity)
              : "",
          minAmount:
            data.condition?.minAmount != null
              ? String(data.condition.minAmount)
              : "",
          discountPercentage:
            data.reward?.discountPercentage != null
              ? String(data.reward.discountPercentage)
              : "",
          freeItemMaxValue:
            data.reward?.freeItemMaxValue != null
              ? String(data.reward.freeItemMaxValue)
              : "",
          excludedCategories: idsToString(data.condition?.excludedCategories),
          targetProducts: idsToString(data.targetProducts),
          startDate: isoToLocalInput(data.timing?.startDate),
          endDate: isoToLocalInput(data.timing?.endDate),
        });
      };

      populate(offer);
      offersService
        .getOffer(offer._id)
        .then((res) => populate(res.data.offer))
        .catch(() => {
          /* keep the row data already populated */
        });
    } else {
      setFormData(emptyForm);
    }
  }, [offer, isOpen]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // The upload component returns the presigned-URL objects; persist the S3
  // mediaUrl of the first uploaded file as image.mediaUrl.
  const handleImageUpload = (urls: any[]) => {
    if (urls.length > 0) {
      setField("imageUrl", urls[0].mediaUrl);
    }
  };

  const config = formData.offerType
    ? FIELD_CONFIG[formData.offerType]
    : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.offerType) {
      toast.error("Please select an offer type");
      return;
    }

    setIsSubmitting(true);

    try {
      const cfg = FIELD_CONFIG[formData.offerType];

      const payload: CreateOfferDto = {
        title: formData.title,
        description: formData.description,
        isActive: formData.isActive,
        image: { mediaUrl: formData.imageUrl },
        offerType: formData.offerType,
      };

      const condition: Record<string, any> = {};
      if (cfg.minQuantity) condition.minQuantity = Number(formData.minQuantity);
      if (cfg.minAmount) condition.minAmount = Number(formData.minAmount);
      if (cfg.excludedCategories)
        condition.excludedCategories = parseIds(formData.excludedCategories);
      if (Object.keys(condition).length) payload.condition = condition;

      const reward: Record<string, any> = {};
      if (cfg.discountPercentage)
        reward.discountPercentage = Number(formData.discountPercentage);
      if (cfg.freeItemMaxValue)
        reward.freeItemMaxValue = Number(formData.freeItemMaxValue);
      if (Object.keys(reward).length) payload.reward = reward;

      if (cfg.timing) {
        payload.timing = {
          startDate: localInputToIso(formData.startDate),
          endDate: localInputToIso(formData.endDate),
        };
      }

      if (cfg.targetProducts)
        payload.targetProducts = parseIds(formData.targetProducts);

      if (offer) {
        await offersService.updateOffer(offer._id, payload);
        toast.success("Offer updated successfully");
      } else {
        await offersService.createOffer(payload);
        toast.success("Offer created successfully");
      }

      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(offer ? "Failed to update offer" : "Failed to create offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={offer ? "Edit Offer" : "Add New Offer"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Field label="Title" htmlFor="offer-title" required>
          <input
            id="offer-title"
            type="text"
            value={formData.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Offer Title"
            className={adminInputClass}
            required
          />
        </Field>

        {/* Description */}
        <Field label="Description" htmlFor="offer-description">
          <textarea
            id="offer-description"
            value={formData.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Description"
            rows={3}
            className={adminInputClass}
          />
        </Field>

        {/* Image */}
        <Field label="Image" htmlFor="offer-image">
          <ImageUpload folder="offers" onUpload={handleImageUpload} />

          {formData.imageUrl && (
            <Thumbnail
              src={formData.imageUrl}
              alt="Offer"
              className="mt-4 h-32 w-full"
            />
          )}
        </Field>

        {/* Offer Type */}
        <Field label="Offer Type" htmlFor="offer-type" required>
          <select
            id="offer-type"
            value={formData.offerType}
            onChange={(e) =>
              setField("offerType", e.target.value as OfferType)
            }
            className={adminInputClass}
            required
          >
            <option value="">Select an offer type</option>
            {OFFER_TYPES.map((type) => (
              <option key={type} value={type}>
                {OFFER_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </Field>

        {/* Conditional fields */}
        {config?.minQuantity && (
          <Field label="Minimum Quantity" htmlFor="offer-min-quantity" required>
            <input
              id="offer-min-quantity"
              type="number"
              min={1}
              value={formData.minQuantity}
              onChange={(e) => setField("minQuantity", e.target.value)}
              placeholder="Minimum item count"
              className={adminInputClass}
              required
            />
          </Field>
        )}

        {config?.minAmount && (
          <Field label="Minimum Amount (EGP)" htmlFor="offer-min-amount" required>
            <input
              id="offer-min-amount"
              type="number"
              min={0}
              step="0.01"
              value={formData.minAmount}
              onChange={(e) => setField("minAmount", e.target.value)}
              placeholder="Minimum cart amount"
              className={adminInputClass}
              required
            />
          </Field>
        )}

        {config?.discountPercentage && (
          <Field
            label="Discount Percentage"
            htmlFor="offer-discount"
            required
          >
            <input
              id="offer-discount"
              type="number"
              min={0}
              max={100}
              value={formData.discountPercentage}
              onChange={(e) => setField("discountPercentage", e.target.value)}
              placeholder="0 – 100"
              className={adminInputClass}
              required
            />
          </Field>
        )}

        {config?.freeItemMaxValue && (
          <Field
            label="Free Item Max Value (EGP)"
            htmlFor="offer-free-item-max"
            required
          >
            <input
              id="offer-free-item-max"
              type="number"
              min={0}
              step="0.01"
              value={formData.freeItemMaxValue}
              onChange={(e) => setField("freeItemMaxValue", e.target.value)}
              placeholder="Max value of the free item"
              className={adminInputClass}
              required
            />
          </Field>
        )}

        {config?.excludedCategories && (
          <Field label="Excluded Categories" htmlFor="offer-excluded">
            <input
              id="offer-excluded"
              type="text"
              value={formData.excludedCategories}
              onChange={(e) => setField("excludedCategories", e.target.value)}
              placeholder="Comma-separated Category IDs"
              className={adminInputClass}
            />
          </Field>
        )}

        {config?.timing && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start Date" htmlFor="offer-start-date" required>
              <input
                id="offer-start-date"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
                className={adminInputClass}
                required
              />
            </Field>
            <Field label="End Date" htmlFor="offer-end-date" required>
              <input
                id="offer-end-date"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
                className={adminInputClass}
                required
              />
            </Field>
          </div>
        )}

        {config?.targetProducts && (
          <Field label="Target Products" htmlFor="offer-target-products" required>
            <input
              id="offer-target-products"
              type="text"
              value={formData.targetProducts}
              onChange={(e) => setField("targetProducts", e.target.value)}
              placeholder="Comma-separated Product IDs"
              className={adminInputClass}
              required
            />
          </Field>
        )}

        {/* Active toggle */}
        <div className="flex items-center justify-between">
          <label
            htmlFor="offer-active"
            className="block text-sm font-medium text-admin-ink"
          >
            Active
          </label>
          <button
            id="offer-active"
            type="button"
            role="switch"
            aria-checked={formData.isActive}
            onClick={() => setField("isActive", !formData.isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              formData.isActive
                ? "bg-admin-brown"
                : "bg-admin-surface-muted"
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
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
