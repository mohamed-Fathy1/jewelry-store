"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { colors } from "@/constants/colors";
import { Address } from "@/types/address.types";
import { RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface ShippingAddressSelectorProps {
  onAddressSelect: (address: Address) => void;
  selectedAddressId?: string;
}

export default function ShippingAddressSelector({
  onAddressSelect,
  selectedAddressId,
}: ShippingAddressSelectorProps) {
  const { user } = useUser();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState<Address | null>(null);

  useEffect(() => {
    if (Array.isArray(user) && user[0]?.addresses) {
      setAddresses(user);
      // Select default address or first address if available
      const defaultAddress =
        user[0].addresses.find((addr) => addr.isDefault) ||
        user[0].addresses[0];
      if (defaultAddress && !selected) {
        setSelected(defaultAddress);
        onAddressSelect(defaultAddress);
      }
    }
  }, [user]);

  useEffect(() => {
    if (selectedAddressId && addresses.length > 0) {
      const address = addresses.find((addr) => addr._id === selectedAddressId);
      if (address) {
        setSelected(address);
      }
    }
  }, [selectedAddressId, addresses]);

  useEffect(() => {
    onAddressSelect(selected);
  }, [onAddressSelect, selected]);

  const handleAddressChange = (address: Address) => {
    setSelected(address);
    onAddressSelect(address);
  };

  return (
    <div className="w-full">
      <RadioGroup value={selected} onChange={handleAddressChange}>
        <RadioGroup.Label
          className="text-lg font-medium mb-4"
          style={{ color: colors.textPrimary }}
        >
          Select Shipping Address
        </RadioGroup.Label>

        <div className="space-y-4 mt-4">
          {addresses.map((address) => (
            <RadioGroup.Option
              key={address._id}
              value={address}
              className={({ active, checked }) =>
                `${active ? "ring-2 ring-offset-2" : ""} ${
                  checked ? "bg-opacity-5 bg-brown" : "bg-white"
                } relative rounded-lg border p-4 cursor-pointer transition-all duration-200 hover:border-brown
                ${checked ? "border-brown" : "border-gray-200"}`
              }
            >
              {({ checked }) => (
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="text-sm">
                      <RadioGroup.Label
                        as="p"
                        className="font-medium"
                        style={{ color: colors.textPrimary }}
                      >
                        {address.street}
                      </RadioGroup.Label>
                      <RadioGroup.Description
                        as="span"
                        className="inline"
                        style={{ color: colors.textSecondary }}
                      >
                        <span>
                          {address.city}, {address.state} {address.postalCode}
                        </span>
                        <span className="block">{address.country}</span>
                      </RadioGroup.Description>
                    </div>
                  </div>
                  {checked && (
                    <div className="shrink-0">
                      <CheckCircleIcon
                        className="h-6 w-6"
                        style={{ color: colors.brown }}
                      />
                    </div>
                  )}
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>

      {addresses.length === 0 && (
        <div
          className="text-center p-4 border rounded-lg mt-4"
          style={{ borderColor: colors.border, color: colors.textSecondary }}
        >
          No shipping addresses found. Please add an address in your profile.
        </div>
      )}
    </div>
  );
}
