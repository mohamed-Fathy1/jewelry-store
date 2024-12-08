"use client";

import { useState } from "react";
import { colors } from "@/constants/colors";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AccountProfile() {
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update logic here
    setIsEditing(false);
  };

  const inputStyle = {
    backgroundColor: colors.background,
    borderColor: colors.border,
    color: colors.textPrimary,
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3
            className="text-xl font-medium mb-4"
            style={{ color: colors.textPrimary }}
          >
            Personal Information
          </h3>
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
                value={profileData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60"
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
                value={profileData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3
            className="text-xl font-medium mb-4"
            style={{ color: colors.textPrimary }}
          >
            Contact Information
          </h3>
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
                value={profileData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60"
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
                value={profileData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Password Change */}
        {isEditing && (
          <div>
            <h3
              className="text-xl font-medium mb-4"
              style={{ color: colors.textPrimary }}
            >
              Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.textPrimary }}
                >
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={profileData.currentPassword}
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
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={profileData.newPassword}
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
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={profileData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all duration-200"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 rounded-md transition-colors duration-200"
              style={{
                backgroundColor: colors.brown,
                color: colors.textLight,
              }}
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="submit"
                className="px-6 py-2 rounded-md transition-colors duration-200"
                style={{
                  backgroundColor: colors.brown,
                  color: colors.textLight,
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 rounded-md border transition-colors duration-200"
                style={{
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
