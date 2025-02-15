"use client";

import { useState, useEffect } from "react";
import { colors } from "@/constants/colors";
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
  const [shippingRegions, setShippingRegions] = useState<ShippingRegion[]>([]);
  const [isAccountOpen, setIsAccountOpen] = useState(true);
  const [isShipToOpen, setIsShipToOpen] = useState(true);
  const [isShippingOpen, setIsShippingOpen] = useState(true);
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
    fetchShippingRegions();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await getProfile();
      setAddresses(response.data.user);
      // Set default address if available
      const defaultAddress = response.data.user.find(
        (addr) => addr._id === localStorage.getItem("defaultAddressId")
      );

      setSelectedAddress(defaultAddress || response.data.user[0]);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  const fetchShippingRegions = async () => {
    try {
      const response = await fetch("https://api.atozaccessory.com/shipping", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await response.json();
      setShippingRegions(data.data.shipping);
    } catch (error) {
      console.error("Failed to fetch shipping regions:", error);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsAddressPopupOpen(true);
  };

  const handleAddressSelect = (address: Address) => {
    setCheckoutSelectedAddress(address);
  };

  return (
    <div className="max-w-2xl mx-auto px-2 md:p-4">
      {/* Account Section */}
      <div
        className="mb-4 border rounded-lg"
        style={{ borderColor: colors.border }}
      >
        <div
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => setIsAccountOpen(!isAccountOpen)}
          style={{ color: colors.textPrimary }}
        >
          <h2 className="text-lg font-medium">Account</h2>
          {isAccountOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
        {isAccountOpen && (
          <div className="p-4 border-t" style={{ borderColor: colors.border }}>
            <p className="text-sm" style={{ color: colors.textPrimary }}>
              {authUser?.email}
            </p>
            <button
              className="text-sm hover:underline mt-2"
              style={{ color: colors.brown }}
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
      <div
        className="mb-4 border rounded-lg"
        style={{ borderColor: colors.border }}
      >
        <div
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => setIsShipToOpen(!isShipToOpen)}
          style={{ color: colors.textPrimary }}
        >
          <h2 className="text-lg font-medium">Ship to</h2>
          {isShipToOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
        {isShipToOpen && (
          <div className="p-4 border-t" style={{ borderColor: colors.border }}>
            {Array.isArray(addresses) &&
              addresses.map((addr) => (
                <label
                  key={addr._id}
                  className="flex justify-between items-start mb-4 p-3 rounded cursor-pointer transition-colors duration-200"
                  style={{
                    backgroundColor:
                      selectedAddress?._id === addr._id
                        ? colors.shadow
                        : colors.background,
                    color: colors.textPrimary,
                  }}
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
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Pencil size={16} style={{ color: colors.brown }} />
                  </button>
                </label>
              ))}
            <button
              className="text-sm hover:underline flex items-center gap-2"
              style={{ color: colors.brown }}
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
      <div
        className="mb-4 border rounded-lg"
        style={{ borderColor: colors.border }}
      >
        <div
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => setIsShippingOpen(!isShippingOpen)}
          style={{ color: colors.textPrimary }}
        >
          <h2 className="text-lg font-medium">Shipping method</h2>
          {isShippingOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
        {isShippingOpen && (
          <div className="p-4 border-t" style={{ borderColor: colors.border }}>
            {shippingRegions.map((region) => (
              <label
                key={region._id}
                className="flex items-center justify-between p-3 mb-2 cursor-pointer rounded transition-colors duration-200"
                style={{
                  backgroundColor:
                    selectedShipping._id === region._id
                      ? colors.shadow
                      : colors.background,
                  color: colors.textPrimary,
                }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value={region.cost}
                    checked={selectedShipping._id === region._id}
                    onChange={(e) => setSelectedShipping(region)}
                    className="mr-3 invisible"
                  />
                  <span>{region.category}</span>
                </div>
                <span>£E{region.cost.toFixed(2)}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Email Preferences */}
      <div className="mb-4">
        <label
          className="flex items-center space-x-2"
          style={{ color: colors.textPrimary }}
        >
          <input type="checkbox" className="form-checkbox" />
          <span className="text-sm">Email me with news and offers</span>
        </label>
      </div>

      <div className="w-full sticky md:static bottom-0">
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-md transition-colors duration-200"
          style={{
            backgroundColor: colors.brown,
            color: colors.textLight,
          }}
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
