"use client";

import { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Address } from "@/types/address.types";
import { addressService } from "@/services/address.service";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import AddressPopup from "@/components/profile/AddressPopup";
import { useUser } from "@/contexts/UserContext";
import { userService } from "@/services/user.service";
import { customerName } from "@/utils/customerName";

export default function AddressManager({
  addresses,
}: {
  addresses?: Address[];
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const { getProfile, defaultAddressId, setDefaultAddressId } = useUser();

  // useEffect(() => {
  //   fetchAddresses();
  // }, []);

  // const fetchAddresses = async () => {
  //   try {
  //     const response = await user
  //     if (response.success) {
  //       setAddresses(response.data.addresses || []);
  //     }
  //   } catch (error) {
  //     toast.error("Failed to fetch addresses");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingAddress?._id) {
        const response = await addressService.updateAddress(
          editingAddress._id,
          formData
        );
        if (response.success) {
          toast.success("Address updated successfully");
        }
      } else {
        const response = await addressService.addAddress(formData);
        if (response.success) {
          toast.success("Address added successfully");
        }
      }
      // fetchAddresses();
      resetForm();
    } catch (error) {
      toast.error("Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    setIsLoading(true);
    try {
      // Replace with the actual user ID as needed
      const deleteUserResponse = await userService.deleteUserInformation(
        addressId
      );
      if (deleteUserResponse.success) {
        toast.success("Address deleted successfully");
        getProfile();
      }
    } catch (error) {
      toast.error("Failed to delete address");
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultAddressId = () => {
    const dbDefault = addresses?.find((a) => a.isDefault)?._id;
    return (
      dbDefault ||
      defaultAddressId ||
      (addresses && addresses.length > 0 ? addresses[0]._id : null)
    );
  };

  const handleSetDefault = async (addressId: string) => {
    setIsLoading(true);
    try {
      // Persist the default server-side so it follows the user across devices.
      await userService.setDefaultAddress(addressId);
      setDefaultAddressId(addressId);
      await getProfile();
      toast.success("Default address updated");
    } catch (error) {
      toast.error("Failed to update default address");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      isDefault: false,
    });
    setEditingAddress(null);
    setIsAddingAddress(false);
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsPopupOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsPopupOpen(true);
    getProfile();
  };

  useEffect(() => {
    console.log(editingAddress);
  }, [editingAddress]);

  if (typeof window === "undefined") return;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl text-heading">
          Shipping Addresses
        </h2>
        <Button
          onClick={handleAddAddress}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Address</span>
        </Button>
      </div>

      {/* Address List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addresses?.map((address) => (
          <div
            key={address._id}
            className="border border-hairline rounded-2xl bg-surface p-4 relative"
          >
            {address._id === getDefaultAddressId() && (
              <span className="absolute top-2 right-2 text-sm px-2 py-1 rounded-full bg-primary text-on-primary">
                Default
              </span>
            )}
            <div className="space-y-2">
              <div className="text-ink-muted">
                <p className="truncate font-medium text-ink">
                  {customerName(address)}
                </p>
                <p className="truncate">{address.address}</p>
                <p className="truncate">
                  {address.shipping?.category || address.governorate}
                  {address.country ? `, ${address.country}` : ""}
                </p>
                <p className="truncate tabular-nums">{address.primaryPhone}</p>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button
                variant="secondary"
                onClick={() => handleEditAddress(address)}
                className="p-2"
                aria-label="Edit address"
              >
                <PencilIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleDelete(address._id!)}
                className="p-2"
                aria-label="Delete address"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
              {address._id !== getDefaultAddressId() && (
                <Button
                  onClick={() => handleSetDefault(address._id!)}
                  className="text-sm"
                >
                  Set as Default
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Address Popup */}
      {isPopupOpen ? (
        <AddressPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          onChanged={getProfile}
          makeDefault={setDefaultAddressId}
          initialEdit={editingAddress}
          startInAddForm={!editingAddress}
        />
      ) : null}
    </div>
  );
}
