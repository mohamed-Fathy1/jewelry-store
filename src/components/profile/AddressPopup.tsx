"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Address } from "@/types/address.types";
import { userService } from "@/services/user.service";
import { toast } from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { LucideChevronDown, Check, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { customerName } from "@/utils/customerName";

interface AddressPopupProps {
  isOpen: boolean;
  onClose: () => void;
  /** Refresh the parent's own address list after add/edit/delete. */
  onChanged?: () => void;
  /** Checkout: pick a saved address (also closes the popup). */
  onSelect?: (a: Address) => void;
  selectedId?: string;
  makeDefault: (id: string | null) => void;
  /** Open straight into the edit form for this address. */
  initialEdit?: Address | null;
  /** Open straight into a blank add form. */
  startInAddForm?: boolean;
  /** Render the add form directly in the page flow (no modal, no saved list).
   *  Used for the checkout empty-state where the customer has no saved address. */
  inline?: boolean;
}

interface ShippingRegion {
  _id: string;
  category: string;
  cost: number;
}

// ─── Egyptian mobile helpers ────────────────────────────────────────────────
const normalizePhone = (v: string): string => {
  let d = (v || "").replace(/\D/g, "");
  if (d.startsWith("20")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 10);
};
const groupPhone = (v: string): string => {
  const d = normalizePhone(v);
  const p: string[] = [];
  if (d.length) p.push(d.slice(0, 2));
  if (d.length > 2) p.push(d.slice(2, 6));
  if (d.length > 6) p.push(d.slice(6, 10));
  return p.join(" ");
};
const isValidPhone = (v: string): boolean => /^1[0-25]\d{8}$/.test(normalizePhone(v));
const toApiPhone = (v: string): string => `0${normalizePhone(v)}`;

type FieldKey = "fullName" | "address" | "shipping" | "primaryPhone" | "secondaryPhone";

const validators: Record<FieldKey, (v: string) => string> = {
  fullName: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
  address: (v) =>
    v.trim().length >= 5 ? "" : "Add a bit more detail so the courier can find you.",
  shipping: (v) => (v ? "" : "Please choose your governorate."),
  primaryPhone: (v) =>
    isValidPhone(v) ? "" : "Enter a valid Egyptian mobile, e.g. 010 1234 5678.",
  secondaryPhone: (v) =>
    v.trim() === "" || isValidPhone(v) ? "" : "That doesn’t look like a valid Egyptian mobile.",
};

const inputBase =
  "w-full appearance-none rounded-[11px] border-[1.5px] bg-bg px-[0.9rem] py-[0.72rem] text-[0.95rem] text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/20";
const labelClass = "mb-[0.4rem] block text-[0.82rem] font-semibold text-ink";
const hintClass = "mt-[0.35rem] text-[0.76rem] text-ink-subtle";
const errClass = "mt-[0.35rem] text-[0.76rem] text-red-600";
const confirmBtn =
  "rounded-[8px] border-[1.5px] px-[0.75rem] py-[0.35rem] text-[0.78rem] font-semibold transition-colors";

const borderState = (err?: string, valid?: boolean) =>
  err ? "border-red-400" : valid ? "border-emerald-500" : "border-hairline";

export default function AddressPopup({
  isOpen,
  onClose,
  onChanged,
  onSelect,
  selectedId,
  makeDefault,
  initialEdit,
  startInAddForm,
  inline,
}: AddressPopupProps) {
  const { getProfile, defaultAddressId } = useUser();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [view, setView] = useState<"list" | "form">("form");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [regions, setRegions] = useState<ShippingRegion[]>([]);

  // Form state
  const [fullName, setFullName] = useState("");
  const [street, setStreet] = useState("");
  const [shipping, setShipping] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const values: Record<FieldKey, string> = {
    fullName,
    address: street,
    shipping,
    primaryPhone,
    secondaryPhone,
  };
  const isFieldValid = (key: FieldKey) => {
    const v = values[key] ?? "";
    return v.trim() !== "" && validators[key](v) === "";
  };

  const resetForm = useCallback(
    (a: Address | null, defaultOn: boolean) => {
      setFullName(a?.fullName || "");
      setStreet(a?.address || "");
      setShipping(a?.shipping?._id || "");
      setPrimaryPhone(a?.primaryPhone ? groupPhone(a.primaryPhone) : "");
      setSecondaryPhone(a?.secondaryPhone ? groupPhone(a.secondaryPhone) : "");
      setIsDefaultAddress(a ? a.isDefault ?? false : defaultOn);
      setErrors({});
      setStatus("idle");
    },
    []
  );

  const loadList = useCallback(async (): Promise<Address[]> => {
    const res = await getProfile();
    const list = (((res as unknown) as { data?: { user?: Address[] } })?.data?.user ?? []) as Address[];
    setAddresses(list);
    return list;
  }, [getProfile]);

  // On open: fetch governorates + saved list, then choose the initial view.
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res = await adminService?.getShippings();
        setRegions(res?.data?.shipping ?? []);
      } catch {
        setRegions([]);
      }
    })();
    (async () => {
      const list = await loadList();
      setConfirmId(null);
      if (inline) {
        // Inline empty-state: always the blank add form, default on.
        setEditingId(null);
        resetForm(null, true);
        setView("form");
      } else if (initialEdit?._id) {
        setEditingId(initialEdit._id);
        resetForm(initialEdit, false);
        setView("form");
      } else if (startInAddForm || list.length === 0) {
        setEditingId(null);
        resetForm(null, list.length === 0);
        setView("form");
      } else {
        setView("list");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const selectedRegion = useMemo(
    () => regions.find((r) => r._id === shipping),
    [regions, shipping]
  );

  const validateField = (key: FieldKey) =>
    setErrors((prev) => ({ ...prev, [key]: validators[key](values[key]) }));
  const clearIfFixed = (key: FieldKey, next: string) => {
    if (errors[key] && !validators[key](next)) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };
  const handlePhoneChange =
    (setter: (v: string) => void, key: FieldKey) => (raw: string) => {
      const formatted = groupPhone(raw);
      setter(formatted);
      clearIfFixed(key, formatted);
    };
  const validateAll = () => {
    const next: Partial<Record<FieldKey, string>> = {};
    (Object.keys(validators) as FieldKey[]).forEach((k) => {
      const msg = validators[k](values[k]);
      if (msg) next[k] = msg;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Navigation ──────────────────────────────────────────────────────────────
  const openAddForm = () => {
    setEditingId(null);
    resetForm(null, addresses.length === 0);
    setView("form");
  };
  const openEditForm = (a: Address) => {
    setEditingId(a._id ?? null);
    resetForm(a, false);
    setView("form");
  };
  const backToList = () => {
    setConfirmId(null);
    setView("list");
  };

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleSelect = (a: Address) => {
    onSelect?.(a);
    onClose();
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await userService.deleteUserInformation(id);
      const list = await loadList();
      onChanged?.();
      setConfirmId(null);
      if (!list.length) {
        openAddForm();
      }
    } catch {
      toast.error("Couldn’t delete this address. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "saving") return;
    if (!validateAll()) return;

    const payload: Record<string, unknown> = {
      fullName: fullName.trim(),
      address: street.trim(),
      shipping,
      primaryPhone: toApiPhone(primaryPhone),
      secondaryPhone: secondaryPhone.trim() ? toApiPhone(secondaryPhone) : "",
      isDefault: isDefaultAddress,
    };

    setStatus("saving");
    try {
      let savedId = editingId;
      if (editingId) {
        await userService.updateProfile(payload, editingId);
      } else {
        const res = await userService.addProfile(payload);
        savedId = res?.data?.user?._id ?? null;
      }
      if (isDefaultAddress && savedId) makeDefault(savedId);
      else if (!isDefaultAddress && defaultAddressId === editingId) makeDefault(null);

      setStatus("saved");
      const list = await loadList();
      onChanged?.();
      setTimeout(() => {
        // Checkout (onSelect present): the parent re-selects the default/new
        // address, so just close. Profile manager: return to the saved list.
        if (onSelect || list.length === 0) onClose();
        else backToList();
      }, 600);
    } catch {
      setStatus("idle");
      toast.error("Couldn’t save your address. Please try again.");
    }
  };

  if (!isOpen) return null;

  const ctaLabel =
    status === "saving"
      ? "Saving…"
      : status === "saved"
      ? editingId
        ? "Address updated"
        : "Address saved"
      : editingId
      ? "Update address"
      : "Save address";

  const showBackLink = view === "form" && addresses.length > 0;

  const inner = (
    <>
      <h2 className="mb-[0.3rem] font-display text-[1.3rem] text-heading">
        {editingId ? "Edit address" : "Add address"}
      </h2>
      <p className="mb-[1.25rem] text-[0.85rem] text-ink-muted">
        Cash on delivery — we only need where to send it and how to reach you.
      </p>

        {/* ── SAVED ADDRESS LIST ─────────────────────────────────────────── */}
        {view === "list" && (
          <div>
            <p className="mb-[0.55rem] text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              Use a saved address
            </p>
            <div className="flex flex-col gap-[0.5rem]">
              {addresses.map((a) => {
                const selected = selectedId ? selectedId === a._id : a.isDefault;
                if (confirmId === a._id) {
                  return (
                    <div
                      key={a._id}
                      className="flex items-center justify-between gap-[0.6rem] rounded-[12px] border-[1.5px] border-red-400 bg-red-500/[0.06] p-[0.8rem]"
                    >
                      <span className="text-[0.84rem] font-semibold text-ink">
                        Delete this address?
                      </span>
                      <div className="flex gap-[0.4rem]">
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          className={`${confirmBtn} border-hairline bg-surface text-ink hover:border-hairline-strong`}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(a._id)}
                          className={`${confirmBtn} border-red-600 bg-red-600 text-white hover:brightness-95`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={a._id}
                    className={`flex items-start gap-[0.7rem] rounded-[12px] border-[1.5px] p-[0.8rem] transition-colors ${
                      selected
                        ? "border-primary bg-accent-soft"
                        : "border-hairline hover:border-hairline-strong"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(a)}
                      className="flex min-w-0 flex-1 items-start gap-[0.7rem] text-left"
                    >
                      <span
                        className={`mt-[0.2rem] grid h-4 w-4 flex-none place-items-center rounded-full border-2 ${
                          selected ? "border-primary" : "border-hairline-strong"
                        }`}
                      >
                        {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[0.9rem] font-semibold text-ink">
                            {customerName(a)}
                          </span>
                          {a.isDefault && (
                            <span className="flex-none rounded-full bg-primary px-[0.5rem] py-[0.18rem] text-[0.62rem] font-bold uppercase tracking-[0.08em] text-on-primary">
                              Default
                            </span>
                          )}
                        </span>
                        <span className="mt-[0.15rem] block truncate text-[0.82rem] text-ink-muted">
                          {[a.address, a.shipping?.category || a.governorate, a.primaryPhone]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    </button>
                    <div className="flex flex-none items-center gap-[0.1rem]">
                      <button
                        type="button"
                        onClick={() => openEditForm(a)}
                        aria-label="Edit address"
                        className="grid h-7 w-7 place-items-center rounded-lg text-ink-subtle transition-colors hover:bg-ink/[0.07] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Pencil className="h-[15px] w-[15px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(a._id ?? null)}
                        aria-label="Delete address"
                        className="grid h-7 w-7 place-items-center rounded-lg text-ink-subtle transition-colors hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Trash2 className="h-[15px] w-[15px]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="my-[1.1rem] flex items-center gap-[0.8rem] text-[0.78rem] text-ink-subtle">
              <span className="h-px flex-1 bg-hairline" />
              or enter a new one
              <span className="h-px flex-1 bg-hairline" />
            </div>
            <button
              type="button"
              onClick={openAddForm}
              className="w-full rounded-[12px] border-[1.5px] border-dashed border-hairline-strong px-3 py-[0.7rem] text-[0.85rem] font-semibold text-ink transition-colors hover:border-primary hover:bg-accent-soft"
            >
              ＋ Add new address
            </button>
          </div>
        )}

        {/* ── NEW / EDIT ADDRESS FORM ────────────────────────────────────── */}
        {view === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {showBackLink && (
              <button
                type="button"
                onClick={backToList}
                className="inline-flex items-center gap-[0.35rem] text-[0.82rem] font-semibold text-primary hover:underline"
              >
                <ArrowLeft className="h-[15px] w-[15px]" /> Back to saved addresses
              </button>
            )}

            <div>
              <label className={labelClass} htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="e.g. Nour Hassan"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearIfFixed("fullName", e.target.value);
                }}
                onBlur={() => validateField("fullName")}
                className={`${inputBase} ${borderState(errors.fullName, isFieldValid("fullName"))}`}
              />
              {errors.fullName && <p className={errClass}>{errors.fullName}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="street">
                Street address
              </label>
              <input
                id="street"
                type="text"
                autoComplete="street-address"
                placeholder="Building no., street, area"
                value={street}
                onChange={(e) => {
                  setStreet(e.target.value);
                  clearIfFixed("address", e.target.value);
                }}
                onBlur={() => validateField("address")}
                className={`${inputBase} ${borderState(errors.address, isFieldValid("address"))}`}
              />
              {errors.address && <p className={errClass}>{errors.address}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="governorate-select">
                Governorate
              </label>
              <div
                className={`relative flex w-full items-center justify-between gap-2 rounded-[11px] border-[1.5px] bg-bg px-[0.9rem] py-[0.72rem] text-[0.95rem] transition-colors focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/20 ${borderState(
                  errors.shipping,
                  !!shipping
                )}`}
              >
                <select
                  id="governorate-select"
                  value={shipping}
                  onChange={(e) => {
                    setShipping(e.target.value);
                    clearIfFixed("shipping", e.target.value);
                  }}
                  onBlur={() => validateField("shipping")}
                  className="absolute inset-0 cursor-pointer opacity-0"
                >
                  <option value="" disabled>
                    Select governorate
                  </option>
                  {regions.map((gov) => (
                    <option key={gov._id} value={gov._id}>
                      {gov.category}
                    </option>
                  ))}
                </select>
                <span className={shipping ? "truncate text-ink" : "truncate text-ink-subtle"}>
                  {selectedRegion?.category || "Select governorate"}
                </span>
                <LucideChevronDown className="h-4 w-4 flex-shrink-0 text-ink-subtle" />
              </div>
              {errors.shipping ? (
                <p className={errClass}>{errors.shipping}</p>
              ) : (
                <p className={hintClass}>Sets your delivery fee automatically.</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-[0.9rem] min-[480px]:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="primaryPhone">
                  Primary phone
                </label>
                <PhoneField
                  id="primaryPhone"
                  value={primaryPhone}
                  error={errors.primaryPhone}
                  onChange={handlePhoneChange(setPrimaryPhone, "primaryPhone")}
                  onBlur={() => validateField("primaryPhone")}
                />
                {errors.primaryPhone ? (
                  <p className={errClass}>{errors.primaryPhone}</p>
                ) : (
                  <p className={hintClass}>Egyptian mobile — the leading 0 is optional.</p>
                )}
              </div>
              <div>
                <label className={labelClass} htmlFor="secondaryPhone">
                  Second phone <span className="font-normal text-ink-subtle">· optional</span>
                </label>
                <PhoneField
                  id="secondaryPhone"
                  value={secondaryPhone}
                  error={errors.secondaryPhone}
                  placeholder="Add a backup number"
                  onChange={handlePhoneChange(setSecondaryPhone, "secondaryPhone")}
                  onBlur={() => validateField("secondaryPhone")}
                />
                {errors.secondaryPhone && <p className={errClass}>{errors.secondaryPhone}</p>}
              </div>
            </div>

            <label className="my-[0.3rem] flex cursor-pointer select-none items-center gap-[0.6rem]">
              <input
                type="checkbox"
                checked={isDefaultAddress}
                onChange={() => setIsDefaultAddress((p) => !p)}
                className="peer sr-only"
              />
              <span
                className={`grid h-5 w-5 place-items-center rounded-[6px] border-[1.5px] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
                  isDefaultAddress ? "border-primary bg-primary" : "border-hairline-strong"
                }`}
              >
                {isDefaultAddress && <Check className="h-3.5 w-3.5 text-on-primary" />}
              </span>
              <span className="text-[0.88rem] text-ink">Set as my default address</span>
            </label>

            <button
              type="submit"
              disabled={status !== "idle"}
              className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-[0.95rem] text-[1rem] font-semibold text-on-primary shadow-card transition-colors disabled:cursor-default disabled:opacity-75 ${
                status === "saved" ? "bg-emerald-600" : "bg-primary hover:bg-primary-hover"
              }`}
            >
              {status === "saving" && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/40 border-t-on-primary" />
              )}
              {status === "saved" && <Check className="h-4 w-4" />}
              {ctaLabel}
            </button>
          </form>
        )}
    </>
  );

  // Inline (checkout empty-state): render the form right in the page flow.
  if (inline) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface p-4 sm:p-5">
        {inner}
      </div>
    );
  }

  // Default: modal overlay.
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-noir/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[20px] bg-surface p-6 shadow-card-hover sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </div>
    </div>
  );
}

function PhoneField({
  id,
  value,
  error,
  placeholder,
  onChange,
  onBlur,
}: {
  id: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (raw: string) => void;
  onBlur: () => void;
}) {
  const valid = value.trim() !== "" && isValidPhone(value);
  const border = error ? "border-red-400" : valid ? "border-emerald-500" : "border-hairline";
  return (
    <div
      className={`flex items-stretch overflow-hidden rounded-[11px] border-[1.5px] bg-bg transition-colors focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/20 ${border}`}
    >
      <span className="flex items-center gap-[0.4rem] border-r border-hairline bg-ink/[0.06] px-[0.85rem] text-[0.9rem] font-semibold text-ink">
        <span className="text-[1.05rem] leading-none">🇪🇬</span> +20
      </span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder={placeholder ?? "1X XXXX XXXX"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="min-w-0 flex-1 border-0 bg-transparent px-[0.9rem] py-[0.72rem] text-[0.95rem] tracking-[0.03em] tabular-nums text-ink outline-none placeholder:text-ink-subtle"
      />
      {valid && (
        <span className="flex items-center pr-[0.85rem] text-emerald-600">
          <Check className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}
