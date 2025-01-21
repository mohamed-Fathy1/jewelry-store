"use client";

import { useState, useEffect, useCallback } from "react";
import { colors } from "@/constants/colors";
import { Button } from "@/components/ui/Button";
import { useUser } from "@/contexts/UserContext";
import AddressManager from "@/components/profile/AddressManager";
import AddressPopup from "@/components/profile/AddressPopup";
import { useAuth } from "@/contexts/AuthContext";

export default function AccountProfile() {
  const { user, getProfile, defaultAddressId } = useUser();
  const { authUser } = useAuth();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [currentDefaultAddress, setCurrentDefaultAddress] = useState();

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getDefaultAddress = useCallback(() => {
    if (!user) return null;

    if (defaultAddressId) {
      return user.find((addr) => addr._id === defaultAddressId);
    }
    return user.length > 0 ? user[0] : null;
  }, [user, defaultAddressId]);

  useEffect(() => {
    setCurrentDefaultAddress(getDefaultAddress());
  }, [defaultAddressId]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-12">
      {/* Basic User Information */}
      <div
        className="max-w-4xl p-6 border rounded-lg"
        style={{ borderColor: colors.border }}
      >
        <h2
          className="text-xl font-medium"
          style={{ color: colors.textPrimary }}
        >
          User Information
        </h2>
        <p style={{ color: colors.textSecondary }}>Email: {authUser?.email}</p>
        <p style={{ color: colors.textSecondary }}>
          Name: {currentDefaultAddress?.firstName}{" "}
          {currentDefaultAddress?.lastName}
        </p>
        <Button className="mt-3" onClick={() => setIsPopupOpen(true)}>
          Manage Addresses
        </Button>
      </div>

      {/* Address Manager */}
      <AddressManager addresses={user} />

      {/* Address Popup */}
      {mounted && isPopupOpen && (
        <AddressPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          address={currentDefaultAddress}
          onAddressUpdated={() => {
            setEditingAddress(null);
            setIsPopupOpen(false);
          }}
        />
      )}
    </div>
  );
}
