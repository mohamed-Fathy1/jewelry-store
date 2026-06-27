"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { useUser } from "@/contexts/UserContext";
import AddressManager from "@/components/profile/AddressManager";
import AddressPopup from "@/components/profile/AddressPopup";
import { useAuth } from "@/contexts/AuthContext";

export default function AccountProfile() {
  const { user, getProfile, defaultAddressId, setDefaultAddressId } = useUser();
  const { authUser } = useAuth();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [currentDefaultAddress, setCurrentDefaultAddress] = useState<any>();

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getDefaultAddress = useCallback(() => {
    // `user` is treated as an address list here by the existing UI.
    const addressList = (user as any) ?? null;
    if (!addressList) return null;

    if (defaultAddressId) {
      return addressList.find((addr: any) => addr._id === defaultAddressId);
    }
    return addressList.length > 0 ? addressList[0] : null;
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
      <div className="max-w-4xl p-6 border border-hairline rounded-2xl bg-surface">
        <h2 className="font-display text-xl text-heading">User Information</h2>
        <p className="text-ink-muted">Email: {authUser?.email}</p>
        <p className="text-ink-muted">
          Name: {currentDefaultAddress?.firstName}{" "}
          {currentDefaultAddress?.lastName}
        </p>
        <Button className="mt-3" onClick={() => setIsPopupOpen(true)}>
          Manage Addresses
        </Button>
      </div>

      {/* Address Manager */}
      <AddressManager addresses={user as any} />

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
          makeDefault={setDefaultAddressId}
        />
      )}
    </div>
  );
}
