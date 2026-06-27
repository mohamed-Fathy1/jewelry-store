"use client";

import { useState } from "react";

interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Props {
  onSubmit: (data: ShippingFormData) => void;
}

const inputClass =
  "w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export default function ShippingForm({ onSubmit }: Props) {
  const [formData, setFormData] = useState<ShippingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="font-display text-2xl mb-6 text-heading">
        Shipping Information
      </h2>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-ink">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-ink">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-ink">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-ink">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium mb-2 text-ink">
          Address
        </label>
        <input
          type="text"
          name="address"
          required
          value={formData.address}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-ink">
          Apartment, suite, etc. (optional)
        </label>
        <input
          type="text"
          name="apartment"
          value={formData.apartment}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* City, State, Zip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-ink">
            City
          </label>
          <input
            type="text"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-ink">
            State
          </label>
          <input
            type="text"
            name="state"
            required
            value={formData.state}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-ink">
            ZIP Code
          </label>
          <input
            type="text"
            name="zipCode"
            required
            value={formData.zipCode}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 rounded-full bg-primary text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Continue to Payment
      </button>
    </form>
  );
}
