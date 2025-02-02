"use client";

import { useEffect, useState } from "react";
import { Address } from "@/types/address.types";
import { userService } from "@/services/user.service";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { ChevronsDown, LucideChevronDown } from "lucide-react";

// Define the governorate enum
enum Governorate {
  Fayoum = "Fayoum",
  Minya = "Minya",
  Sohag = "Sohag",
  BeniSuef = "Beni Suef",
  Assiut = "Assiut",
  Qena = "Qena",
  Aswan = "Aswan",
  Luxor = "Luxor",
  Qalyubia = "Qalyubia",
  Dakahlia = "Dakahlia",
  Monufia = "Monufia",
  Sharqia = "Sharqia",
  KafrElSheikh = "Kafr El Sheikh",
  Beheira = "Beheira",
  Gharbia = "Gharbia",
  PortSaid = "Port Said",
  Suez = "Suez",
  Ismailia = "Ismailia",
  Damietta = "Damietta",
  AlSaf = "Al Saf",
  AlBadrashein = "Al Badrashein",
  AlAyat = "Al Ayat",
  Atfih = "Atfih",
  Oseem = "Oseem",
  AbuNomros = "Abu Nomros",
  Hawamdeya = "Hawamdeya",
  ElMonib = "El Monib",
  Tanashe = "Tanashe",
  ManshaatAlQanater = "Mansha'at Al Qanater",
  ElBaragil = "El Baragil",
  Bashteel = "Bashteel",
  Kerdasa = "Kerdasa",
  ShubraMant = "Shubra Mant",
  SaftAlLaban = "Saft Al Laban",
  AlOmraniya = "Al Omraniya",
  AlMariouteya = "Al Mariouteya",
  Cairo = "Cairo",
  Giza = "Giza",
  ElShorouk = "El Shorouk",
  ElMostakbal = "El Mostakbal",
  ElRehab = "El Rehab",
  Madinaty = "Madinaty",
  October = "October",
  SheikhZayed = "Sheikh Zayed",
  NewCairo = "New Cairo (El Tagamoat)",
  Other = "Other",
}

interface AddressPopupProps {
  isOpen: boolean;
  onClose: () => void;
  address?: Address | null;
  onAddressUpdated: () => void;
  setAddresses: any;
}

export default function AddressPopup({
  isOpen,
  onClose,
  address,
  onAddressUpdated,
  setAddresses,
}: AddressPopupProps) {
  const [formData, setFormData] = useState<Omit<Address, "_id">>({
    firstName: address?.firstName || "",
    lastName: address?.lastName || "",
    apartmentSuite: address?.apartmentSuite || "",
    governorate: address?.governorate || "",
    address: address?.address || "",
    postalCode: address?.postalCode || "",
    primaryPhone: address?.primaryPhone || "",
    secondaryPhone: address?.secondaryPhone || "",
  });

  const { user } = useUser();

  useEffect(() => {
    console.log("address", address);
    console.log("formData", formData);
  }, [address, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (address?._id) {
        console.log("address.Id", address?._id);

        await userService.updateProfile(formData, address._id);
        toast.success("Address updated successfully");
      } else {
        console.log("useriD", user._id);
        await userService.addProfile(formData);
        toast.success("Address added successfully");
      }
      // setAddresses((prev) => [...prev, formData]);
      onAddressUpdated();
      onClose();
    } catch (error) {
      toast.error("Failed to save address");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 my-0! flex items-center justify-center z-50"
      style={{ margin: "0px" }}
    >
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-medium mb-4">
          {address ? "Edit Address" : "Add Address"}
        </h2>
        <form key="address-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">First Name</label>
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="border rounded-md p-2 w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Last Name</label>
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="border rounded-md p-2 w-full"
                required
              />
            </div>
          </div>
          <div>
            <label className="block mb-1">Street Address</label>
            <input
              type="text"
              placeholder="Street Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="border rounded-md p-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block mb-1">
              Apartment, Suite, etc. (optional)
            </label>
            <input
              type="text"
              placeholder="Apartment, Suite, etc."
              value={formData.apartmentSuite}
              onChange={(e) =>
                setFormData({ ...formData, apartmentSuite: e.target.value })
              }
              className="border rounded-md p-2 w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Governorate</label>
              <div className="flex justify-between border rounded-md p-2 relative w-full">
                <select
                  value={formData.governorate}
                  onChange={(e) =>
                    setFormData({ ...formData, governorate: e.target.value })
                  }
                  className="absolute inset-0 opacity-0 border rounded-md p-2"
                  required
                >
                  <option value="" disabled>
                    Select Governorate
                  </option>
                  {Object.values(Governorate).map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
                <span>{formData.governorate || "Governate"}</span>
                <LucideChevronDown />
              </div>
            </div>
            <div>
              <label className="block mb-1">Postal Code (Opt)</label>
              <input
                type="text"
                placeholder="Postal Code"
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                className="border rounded-md p-2 w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Primary Phone</label>
              <input
                type="tel"
                placeholder="Primary Phone"
                value={formData.primaryPhone}
                onChange={(e) =>
                  setFormData({ ...formData, primaryPhone: e.target.value })
                }
                className="border rounded-md p-2 w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Secondary Phone (optional)</label>
              <input
                type="tel"
                placeholder="Secondary Phone"
                value={formData.secondaryPhone}
                onChange={(e) =>
                  setFormData({ ...formData, secondaryPhone: e.target.value })
                }
                className="border rounded-md p-2 w-full"
              />
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) =>
                setFormData({ ...formData, isDefault: e.target.checked })
              }
            />
            <label className="ml-2">Set as default address</label>
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
