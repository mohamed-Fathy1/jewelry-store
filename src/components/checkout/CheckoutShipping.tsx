"use client";

import { useState, useEffect, useMemo } from "react";
import AddressPopup from "../profile/AddressPopup";
import { Address } from "@/types/address.types";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckout } from "@/contexts/CheckoutContext";

interface ShippingRegion {
  _id: string;
  category: string;
  cost: number;
}

export default function CheckoutShipping({ onSubmit }) {
  const [isAddressPopupOpen, setIsAddressPopupOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(true);
  const [isShipToOpen, setIsShipToOpen] = useState(true);
  const { authUser } = useAuth();
  const { getProfile, setDefaultAddressId } = useUser();
  const {
    selectedAddress,
    setSelectedAddress,
    selectedShipping,
    setSelectedShipping,
  } = useCheckout();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response: any = await getProfile();
      setAddresses(response.data.user);
      // Set default address if available
      const defaultAddress = response.data.user.find(
        (addr: any) => addr._id === localStorage.getItem("defaultAddressId")
      );

      setSelectedAddress(defaultAddress || response.data.user[0]);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsAddressPopupOpen(true);
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };

  const selectedShippingRegion = useMemo(() => {
    if (!selectedAddress) return null;
    // Assuming you have a way to get the shipping region based on the address
    setSelectedShipping(selectedAddress.shipping);
    return selectedAddress.shipping;
  }, [selectedAddress]);

  return (
    <div className="max-w-2xl mx-auto px-2 md:p-4">
      {/* Account Section */}
      <div className="mb-4 border border-hairline rounded-lg">
        <div
          className="flex justify-between items-center p-4 cursor-pointer text-ink"
          onClick={() => setIsAccountOpen(!isAccountOpen)}
        >
          <h2 className="text-lg font-medium">Account</h2>
          {isAccountOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
        {isAccountOpen && (
          <div className="p-4 border-t border-hairline">
            <p className="text-sm text-ink">{authUser?.email}</p>
            <button
              className="text-sm hover:underline mt-2 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => {
                /* Handle logout */
              }}
            >
              Log out
            </button>
          </div>
        )}
      </div>

      {/* Ship To Section */}
      <div className="mb-4 border border-hairline rounded-lg">
        <div
          className="flex justify-between items-center p-4 cursor-pointer text-ink"
          onClick={() => setIsShipToOpen(!isShipToOpen)}
        >
          <h2 className="text-lg font-medium">Ship to</h2>
          {isShipToOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
        {isShipToOpen && (
          <div className="p-4 border-t border-hairline">
            {Array.isArray(addresses) &&
              addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`flex justify-between items-start mb-4 p-3 rounded cursor-pointer transition-colors duration-200 text-ink ${
                    selectedAddress?._id === addr._id
                      ? "bg-accent-soft"
                      : "bg-surface"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?._id === addr._id}
                      onChange={() => setSelectedAddress(addr)}
                      className="mt-1 invisible"
                    />
                    <div>
                      <p className="font-medium">
                        {addr.firstName} {addr.lastName}
                      </p>
                      <p className="text-sm">{addr.address}</p>
                      <p className="text-sm">
                        {addr.governorate}, {addr.postalCode}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleEditAddress(addr);
                    }}
                    aria-label="Edit address"
                    className="p-2 hover:bg-surface-muted rounded-full transition-colors text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Pencil size={16} />
                  </button>
                </label>
              ))}
            <button
              className="text-sm hover:underline flex items-center gap-2 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => {
                setEditingAddress(null);
                setIsAddressPopupOpen(true);
              }}
            >
              + Use a different address
            </button>
          </div>
        )}
      </div>

      {/* Shipping Method Section */}
      <div className="mb-4 border border-hairline rounded-lg">
        <div className="flex justify-between items-center p-4 cursor-pointer text-ink">
          <h2 className="text-lg font-medium">Shipping method</h2>
        </div>
        {selectedShippingRegion && (
          <div className="p-4 border-t border-hairline">
            <label className="flex items-center justify-between p-3 mb-2 cursor-pointer rounded transition-colors duration-200 bg-accent-soft text-ink">
              <div className="flex items-center gap-3">
                <span>{selectedShippingRegion.category}</span>
              </div>
              <span className="tabular-nums">
                EGP {selectedShippingRegion.cost.toFixed(2)}
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Email Preferences */}
      <div className="mb-4">
        <label className="flex items-center space-x-2 text-ink">
          <input type="checkbox" className="form-checkbox" />
          <span className="text-sm">Email me with news and offers</span>
        </label>
      </div>

      <div className="w-full sticky md:static bottom-0">
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-full bg-primary text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={onSubmit}
        >
          Continue to Payment
        </button>
      </div>

      {/* Address Popup */}
      {isAddressPopupOpen ? (
        <AddressPopup
          isOpen={isAddressPopupOpen}
          onClose={() => setIsAddressPopupOpen(false)}
          onAddressUpdated={fetchAddresses}
          setAddresses={setAddresses}
          address={editingAddress}
          makeDefault={setDefaultAddressId}
        />
      ) : null}
    </div>
  );
}
