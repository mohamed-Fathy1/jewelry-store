"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { colors } from "@/constants/colors";
import { Offer, OfferType, CreateOfferDto } from "@/types/offer.types";
import { offersService } from "@/services/offers.service";
import { OFFER_TYPE_LABELS } from "./OfferList";
import ImageUpload from "../products/ImageUpload";

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

const inputClass =
  "mt-1 p-1 md:px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown";

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

// "665e...,665f..." <-> array of ids (objects are populated on GET).
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
      toast.error(
        offer ? "Failed to update offer" : "Failed to create offer"
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

        <div className="relative bg-white rounded-lg w-full max-w-lg mx-auto p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title
              className="text-xl font-semibold"
              style={{ color: colors.textPrimary }}
            >
              {offer ? "Edit Offer" : "Add New Offer"}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Offer Title"
                className={inputClass}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Description"
                rows={3}
                className={inputClass}
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <ImageUpload folder="offers" onUpload={handleImageUpload} />

              {formData.imageUrl && (
                <div className="mt-4">
                  <img
                    src={formData.imageUrl}
                    alt="Offer"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Offer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Offer Type
              </label>
              <select
                value={formData.offerType}
                onChange={(e) =>
                  setField("offerType", e.target.value as OfferType)
                }
                className={inputClass}
                required
              >
                <option value="">Select an offer type</option>
                {OFFER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {OFFER_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional fields */}
            {config?.minQuantity && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.minQuantity}
                  onChange={(e) => setField("minQuantity", e.target.value)}
                  placeholder="Minimum item count"
                  className={inputClass}
                  required
                />
              </div>
            )}

            {config?.minAmount && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Amount (EGP)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.minAmount}
                  onChange={(e) => setField("minAmount", e.target.value)}
                  placeholder="Minimum cart amount"
                  className={inputClass}
                  required
                />
              </div>
            )}

            {config?.discountPercentage && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    setField("discountPercentage", e.target.value)
                  }
                  placeholder="0 - 100"
                  className={inputClass}
                  required
                />
              </div>
            )}

            {config?.freeItemMaxValue && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Free Item Max Value (EGP)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.freeItemMaxValue}
                  onChange={(e) =>
                    setField("freeItemMaxValue", e.target.value)
                  }
                  placeholder="Max value of the free item"
                  className={inputClass}
                  required
                />
              </div>
            )}

            {config?.excludedCategories && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Excluded Categories
                </label>
                <input
                  type="text"
                  value={formData.excludedCategories}
                  onChange={(e) =>
                    setField("excludedCategories", e.target.value)
                  }
                  placeholder="Comma-separated Category IDs"
                  className={inputClass}
                />
              </div>
            )}

            {config?.timing && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setField("startDate", e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setField("endDate", e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            )}

            {config?.targetProducts && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Target Products
                </label>
                <input
                  type="text"
                  value={formData.targetProducts}
                  onChange={(e) => setField("targetProducts", e.target.value)}
                  placeholder="Comma-separated Product IDs"
                  className={inputClass}
                  required
                />
              </div>
            )}

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Active
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={formData.isActive}
                onClick={() => setField("isActive", !formData.isActive)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                style={{
                  backgroundColor: formData.isActive
                    ? colors.brown
                    : "#D1D5DB",
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
                  : offer
                  ? "Update Offer"
                  : "Create Offer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
