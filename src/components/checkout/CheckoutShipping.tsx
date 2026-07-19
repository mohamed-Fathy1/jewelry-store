"use client";

import { useState, useEffect, useMemo } from "react";
import AddressPopup from "../profile/AddressPopup";
import { Address } from "@/types/address.types";
import { ChevronDown, ChevronUp, Pencil, Trash2, ArrowRight } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { Button } from "@/components/ui/Button";
import { customerName } from "@/utils/customerName";
import { userService } from "@/services/user.service";
import { toast } from "react-hot-toast";

interface ShippingRegion {
  _id: string;
  category: string;
  cost: number;
}

export default function CheckoutShipping({
  onSubmit,
  total,
  previewLoading,
}: {
  onSubmit: (data?: any) => void;
  total?: number | null;
  previewLoading?: boolean;
}) {
  const [isAddressPopupOpen, setIsAddressPopupOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
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
      const list = response.data.user;
      setAddresses(list);
      // Prefer the DB-persisted default; fall back to the local cache, then first.
      const cachedDefaultId = localStorage.getItem("defaultAddressId");
      const defaultAddress =
        list.find((addr: any) => addr.isDefault) ||
        list.find((addr: any) => addr._id === cachedDefaultId);

      setSelectedAddress(defaultAddress || list[0]);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsAddressPopupOpen(true);
  };

  const handleDeleteAddress = async (id?: string) => {
    if (!id) return;
    try {
      await userService.deleteUserInformation(id);
      setConfirmingDeleteId(null);
      await fetchAddresses();
      toast.success("Address deleted");
    } catch {
      toast.error("Couldn’t delete this address. Please try again.");
    }
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
    <div className="max-w-2xl mx-auto px-1 pb-28 sm:px-2 md:p-4 md:pb-4">
      {/* Account Section */}
      <div className="mb-4 border border-hairline rounded-2xl">
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
      <div className="mb-4 border border-hairline rounded-2xl">
        <div
          className="flex justify-between items-center p-4 cursor-pointer text-ink"
          onClick={() => setIsShipToOpen(!isShipToOpen)}
        >
          <h2 className="text-lg font-medium">Ship to</h2>
          {isShipToOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
        {isShipToOpen && (
          <div className="p-4 border-t border-hairline">
            {addresses.length === 0 ? (
              // No saved address → show the add form directly (no button/popup).
              <AddressPopup
                inline
                isOpen
                onClose={() => {}}
                onChanged={fetchAddresses}
                onSelect={(a) => setSelectedAddress(a)}
                makeDefault={setDefaultAddressId}
              />
            ) : (
              <>
            {Array.isArray(addresses) &&
              addresses.map((addr) => {
                const selected = selectedAddress?._id === addr._id;
                if (confirmingDeleteId === addr._id) {
                  return (
                    <div
                      key={addr._id}
                      className="mb-2 flex items-center justify-between gap-[0.6rem] rounded-[12px] border-[1.5px] border-red-400 bg-red-500/[0.06] p-[0.8rem]"
                    >
                      <span className="text-[0.84rem] font-semibold text-ink">
                        Delete this address?
                      </span>
                      <div className="flex gap-[0.4rem]">
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(null)}
                          className="rounded-[8px] border-[1.5px] border-hairline bg-surface px-[0.75rem] py-[0.35rem] text-[0.78rem] font-semibold text-ink transition-colors hover:border-hairline-strong"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="rounded-[8px] border-[1.5px] border-red-600 bg-red-600 px-[0.75rem] py-[0.35rem] text-[0.78rem] font-semibold text-white transition hover:brightness-95"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                }
                return (
                  <label
                    key={addr._id}
                    className={`mb-2 flex cursor-pointer items-start gap-[0.7rem] rounded-[12px] border-[1.5px] p-[0.8rem] transition-colors ${
                      selected
                        ? "border-primary bg-accent-soft"
                        : "border-hairline bg-surface hover:border-hairline-strong"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selected}
                      onChange={() => setSelectedAddress(addr)}
                      className="sr-only"
                    />
                    <span
                      className={`mt-[0.2rem] grid h-4 w-4 flex-none place-items-center rounded-full border-2 ${
                        selected ? "border-primary" : "border-hairline-strong"
                      }`}
                    >
                      {selected && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[0.9rem] font-semibold text-ink">
                          {customerName(addr)}
                        </p>
                        {addr.isDefault && (
                          <span className="ml-auto flex-none rounded-full bg-primary px-[0.5rem] py-[0.18rem] text-[0.62rem] font-bold uppercase tracking-[0.08em] text-on-primary">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[0.82rem] text-ink-muted">
                        {[
                          addr.address,
                          addr.shipping?.category || addr.governorate,
                          addr.primaryPhone,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="flex flex-none items-center gap-[0.1rem]">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleEditAddress(addr);
                        }}
                        aria-label="Edit address"
                        className="grid h-7 w-7 place-items-center rounded-lg text-ink-subtle transition-colors hover:bg-ink/[0.07] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setConfirmingDeleteId(addr._id ?? null);
                        }}
                        aria-label="Delete address"
                        className="grid h-7 w-7 place-items-center rounded-lg text-ink-subtle transition-colors hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </label>
                );
              })}
            <button
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-dashed border-hairline-strong px-3 py-[0.7rem] text-[0.85rem] font-semibold text-ink transition-colors hover:border-primary hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => {
                setEditingAddress(null);
                setIsAddressPopupOpen(true);
              }}
            >
              ＋ Add new address
            </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Shipping Method Section */}
      <div className="mb-4 border border-hairline rounded-2xl">
        <div className="flex justify-between items-center p-4 cursor-pointer text-ink">
          <h2 className="text-lg font-medium">Shipping method</h2>
        </div>
        {selectedShippingRegion && (
          <div className="p-4 border-t border-hairline">
            <label className="flex items-center justify-between p-3 mb-2 cursor-pointer rounded-xl transition-colors duration-200 bg-accent-soft text-ink">
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
        <label className="flex items-center gap-2 text-ink">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-hairline accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <span className="text-sm">Email me with news and offers</span>
        </label>
      </div>

      {/* Mobile: a fixed action bar showing the live total next to the CTA, so
          both stay in view after the form scrolls. Desktop: inline (the total
          already lives in the Order Summary), so the button fills the width. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgba(74,67,60,0.06)] backdrop-blur md:static md:z-auto md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          {/* Total — mobile only (desktop shows it in the Order Summary). */}
          <div className="min-w-0 shrink-0 md:hidden">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.1em] text-ink-muted">
              Total
            </p>
            {typeof total === "number" ? (
              <p className="text-lg font-semibold tabular-nums leading-tight text-heading">
                EGP {total.toFixed(2)}
              </p>
            ) : (
              <p className="text-lg font-semibold leading-tight text-ink-subtle">
                {previewLoading ? "…" : "—"}
              </p>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            onClick={onSubmit}
            className="flex-1 md:w-full"
          >
            <span className="flex items-center justify-center gap-2">
              Continue to Payment
              <ArrowRight className="h-[18px] w-[18px]" />
            </span>
          </Button>
        </div>
      </div>

      {/* Address Popup */}
      {isAddressPopupOpen ? (
        <AddressPopup
          isOpen={isAddressPopupOpen}
          onClose={() => setIsAddressPopupOpen(false)}
          onChanged={fetchAddresses}
          onSelect={(a) => setSelectedAddress(a)}
          selectedId={selectedAddress?._id}
          makeDefault={setDefaultAddressId}
          initialEdit={editingAddress}
          startInAddForm={!editingAddress}
        />
      ) : null}
    </div>
  );
}
