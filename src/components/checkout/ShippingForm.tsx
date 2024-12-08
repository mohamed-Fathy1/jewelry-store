"use client";

import { useState } from "react";
import { colors } from "@/constants/colors";

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

  const inputStyle = {
    backgroundColor: colors.background,
    borderColor: colors.border,
    color: colors.textPrimary,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2
        className="text-2xl font-light mb-6"
        style={{ color: colors.textPrimary }}
      >
        Shipping Information
      </h2>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: colors.textPrimary }}
          >
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: colors.textPrimary }}
          >
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: colors.textPrimary }}
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: colors.textPrimary }}
          >
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.textPrimary }}
        >
          Address
        </label>
        <input
          type="text"
          name="address"
          required
          value={formData.address}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200"
          style={inputStyle}
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.textPrimary }}
        >
          Apartment, suite, etc. (optional)
        </label>
        <input
          type="text"
          name="apartment"
          value={formData.apartment}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200"
          style={inputStyle}
        />
      </div>

      {/* City, State, Zip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: colors.textPrimary }}
          >
            City
          </label>
          <input
            type="text"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: colors.textPrimary }}
          >
            State
          </label>
          <input
            type="text"
            name="state"
            required
            value={formData.state}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: colors.textPrimary }}
          >
            ZIP Code
          </label>
          <input
            type="text"
            name="zipCode"
            required
            value={formData.zipCode}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200"
            style={inputStyle}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 rounded-md transition-colors duration-200"
        style={{
          backgroundColor: colors.brown,
          color: colors.textLight,
        }}
      >
        Continue to Payment
      </button>
    </form>
  );
}
