"use client";

import { useEffect, useState } from "react";
import { Address } from "@/types/address.types";
import { userService } from "@/services/user.service";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { LucideChevronDown } from "lucide-react";
import { adminService } from "@/services/admin.service";
import Joi from "joi";

interface AddressPopupProps {
  isOpen: boolean;
  onClose: () => void;
  address?: Address | null;
  onAddressUpdated: (address: Address) => void;
  setAddresses?: any;
  makeDefault: (id: string) => void;
}

// Define the validation schema
const addressSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    "string.base": "First name must be a string.",
    "string.empty": "First name is required.",
    "string.min": "First name must be at least 2 characters long.",
    "string.max": "First name must be at most 50 characters long.",
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    "string.base": "Last name must be a string.",
    "string.empty": "Last name is required.",
    "string.min": "Last name must be at least 2 characters long.",
    "string.max": "Last name must be at most 50 characters long.",
  }),
  address: Joi.string().min(1).max(500).required().messages({
    "string.base": "Street address must be a string.",
    "string.empty": "Street address is required.",
    "string.min": "Street address must be at least 1 character long.",
    "string.max": "Street address must be at most 500 characters long.",
  }),
  apartmentSuite: Joi.string().min(1).max(500).allow("").optional().messages({
    "string.base": "Apartment/Suite must be a string.",
    "string.max": "Apartment/Suite must be at most 500 characters long.",
  }),
  shipping: Joi.string().required().messages({
    "string.base": "Shipping is required.",
  }),
  postalCode: Joi.string().min(3).max(6).allow("").optional().messages({
    "string.base": "Postal code must be a string.",
    "string.min": "Postal code must be at least 3 characters long.",
    "string.max": "Postal code must be at most 6 characters long.",
  }),
  primaryPhone: Joi.string()
    .pattern(/^(\+?2)?01[0-25]\d{8}$/)
    .required()
    .messages({
      "string.base": "Primary phone must be a string.",
      "string.empty": "Primary phone is required.",
      "string.pattern.base":
        "Primary phone must be a valid Egyptian phone number.",
    }),
  secondaryPhone: Joi.string()
    .pattern(/^(\+?2)?01[0-25]\d{8}$/)
    .allow("")
    .optional()
    .messages({
      "string.base": "Secondary phone must be a string.",
      "string.pattern.base":
        "Secondary phone must be a valid Egyptian phone number.",
    }),
});

const inputClass =
  "w-full rounded-lg border border-hairline bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-subtle transition-colors focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";

export default function AddressPopup({
  isOpen,
  onClose,
  address,
  onAddressUpdated,
  setAddresses,
  makeDefault,
}: AddressPopupProps) {
  const [formData, setFormData] = useState<Omit<Address, "_id">>({
    firstName: address?.firstName || "",
    lastName: address?.lastName || "",
    apartmentSuite: address?.apartmentSuite || "",
    shipping: address?.shipping._id || "",
    address: address?.address || "",
    postalCode: address?.postalCode || "",
    primaryPhone: address?.primaryPhone || "",
    secondaryPhone: address?.secondaryPhone || "",
  });
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState([]);

  const { user, defaultAddressId } = useUser();

  useEffect(() => {
    const fetchShippingAddress = async () => {
      const res = await adminService?.getShippings();
      setShippingAddress(res.data.shipping);
    };
    fetchShippingAddress();
  }, []);

  useEffect(() => {
    if (address?._id === defaultAddressId) {
      setIsDefaultAddress(true);
    }
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate formData against the schema
      const { error } = addressSchema.validate(formData);
      if (error) {
        toast.error(error.details[0].message); // Show validation error
        return;
      }

      if (address?._id) {
        if (isDefaultAddress) makeDefault(address._id);

        if (!isDefaultAddress && defaultAddressId === address._id) {
          makeDefault(null);
        }
        await userService.updateProfile(formData, address._id);
        toast.success("Address updated successfully");
      } else {
        const res = await userService.addProfile(formData);
        if (isDefaultAddress) makeDefault(res.data.user._id);
        toast.success("Address added successfully");
      }
      // setAddresses((prev) => [...prev, formData]);
      onAddressUpdated(formData as Address);
      onClose();
    } catch (error) {
      toast.error("Failed to save address");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-noir/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 font-display text-xl text-heading">
          {address ? "Edit Address" : "Add Address"}
        </h2>
        <form key="address-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Street Address</label>
            <input
              type="text"
              placeholder="Street Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>
              Apartment, Suite, etc. (optional)
            </label>
            <input
              type="text"
              placeholder="Apartment, Suite, etc."
              value={formData.apartmentSuite}
              onChange={(e) =>
                setFormData({ ...formData, apartmentSuite: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="governorate-select">
                Governorate
              </label>
              <div className="relative flex w-full items-center justify-between gap-2 rounded-lg border border-hairline bg-surface px-3.5 py-2.5 text-sm transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent">
                <select
                  id="governorate-select"
                  value={formData.shipping || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shipping: e.target.value,
                    })
                  }
                  className="absolute inset-0 cursor-pointer opacity-0"
                  required
                >
                  <option value="" disabled>
                    Select governorate
                  </option>
                  {shippingAddress.map((gov) => (
                    <option key={gov._id} value={gov._id}>
                      {gov.category}
                    </option>
                  ))}
                </select>
                <span
                  className={
                    formData.shipping ? "truncate text-ink" : "truncate text-ink-subtle"
                  }
                >
                  {shippingAddress.find((gov) => gov._id === formData.shipping)
                    ?.category || "Select governorate"}
                </span>
                <LucideChevronDown className="h-4 w-4 flex-shrink-0 text-ink-subtle" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Postal Code (Opt)</label>
              <input
                type="text"
                placeholder="Postal Code"
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Primary Phone</label>
              <input
                type="tel"
                placeholder="Primary Phone"
                value={formData.primaryPhone}
                onChange={(e) =>
                  setFormData({ ...formData, primaryPhone: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Secondary Phone (optional)</label>
              <input
                type="tel"
                placeholder="Secondary Phone"
                value={formData.secondaryPhone}
                onChange={(e) =>
                  setFormData({ ...formData, secondaryPhone: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="defaultCheckbox"
              name="default"
              type="checkbox"
              checked={isDefaultAddress}
              onChange={() => setIsDefaultAddress((prev) => !prev)}
              className="h-4 w-4 rounded border-hairline accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            <label htmlFor="defaultCheckbox" className="text-sm text-ink">
              Set as default address
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{address ? "Update" : "Add"} Address</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
