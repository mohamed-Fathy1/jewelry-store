"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
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
        <RadioGroup.Label className="text-lg font-medium mb-4 text-heading">
          Select Shipping Address
        </RadioGroup.Label>

        <div className="space-y-4 mt-4">
          {addresses.map((address) => (
            <RadioGroup.Option
              key={address._id}
              value={address}
              className={({ active, checked }) =>
                `${active ? "ring-2 ring-accent ring-offset-2" : ""} ${
                  checked ? "bg-accent-soft" : "bg-surface"
                } relative rounded-lg border p-4 cursor-pointer transition-all duration-200 hover:border-hairline-strong
                ${checked ? "border-primary" : "border-hairline"}`
              }
            >
              {({ checked }) => (
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="text-sm">
                      <RadioGroup.Label
                        as="p"
                        className="font-medium text-ink"
                      >
                        {address.street}
                      </RadioGroup.Label>
                      <RadioGroup.Description
                        as="span"
                        className="inline text-ink-muted"
                      >
                        <span>
                          {address.city}, {address.state}
                        </span>
                        <span className="block">{address.country}</span>
                      </RadioGroup.Description>
                    </div>
                  </div>
                  {checked && (
                    <div className="shrink-0">
                      <CheckCircleIcon className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>

      {addresses.length === 0 && (
        <div className="text-center p-4 border border-hairline rounded-lg mt-4 text-ink-muted">
          No shipping addresses found. Please add an address in your profile.
        </div>
      )}
    </div>
  );
}
