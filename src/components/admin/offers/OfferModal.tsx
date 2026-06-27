"use client";

import { ReactNode, useEffect, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Offer, OfferType, CreateOfferDto } from "@/types/offer.types";
import { offersService } from "@/services/offers.service";
import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import { OFFER_TYPE_META, OFFER_TYPES } from "./offerMeta";
import ImageUpload from "../products/ImageUpload";
import {
  Modal,
  Field,
  Button,
  Toggle,
  Select,
  MultiSelect,
  Thumbnail,
  adminInputClass,
  type SelectOption,
} from "@/components/admin/ui";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer?: Offer | null;
  onSuccess?: () => void;
}

// Which conditional fields each offer type requires.
const FIELD_CONFIG: Record<
  OfferType,
  {
    minQuantity?: boolean;
    minAmount?: boolean;
    discountPercentage?: boolean;
    freeItemMaxValue?: boolean;
    excludedCategories?: boolean;
    timing?: boolean;
    targetProducts?: boolean;
  }
> = {
  buy_x_get_cheapest_free: { minQuantity: true },
  spend_x_get_discount: { minAmount: true, discountPercentage: true },
  spend_x_get_free_shipping: { minAmount: true },
  buy_x_get_free_shipping: { minQuantity: true, excludedCategories: true },
  buy_x_get_half_price: { minQuantity: true },
  spend_x_get_free_item: { minAmount: true, freeItemMaxValue: true },
  flash_sale: { timing: true, discountPercentage: true, targetProducts: true },
};

const TYPE_OPTIONS: SelectOption[] = OFFER_TYPES.map((t) => ({
  value: t,
  label: OFFER_TYPE_META[t].label,
  description: OFFER_TYPE_META[t].short,
}));

const emptyForm = {
  title: "",
  description: "",
  isActive: true,
  imageUrl: "",
  offerType: "" as OfferType | "",
  minQuantity: "",
  minAmount: "",
  discountPercentage: "",
  freeItemMaxValue: "",
  excludedCategories: [] as string[],
  targetProducts: [] as string[],
  startDate: "",
  endDate: "",
};
type FormState = typeof emptyForm;

const toIds = (items?: any[]): string[] =>
  (items || [])
    .map((i) => (typeof i === "object" && i ? i._id : i))
    .filter(Boolean);

const toLabels = (items: any[] | undefined, key: string): Record<string, string> => {
  const map: Record<string, string> = {};
  (items || []).forEach((i) => {
    if (typeof i === "object" && i?._id) map[i._id] = i[key] ?? i._id;
  });
  return map;
};

const isoToLocalInput = (iso?: string | null): string =>
  iso ? format(new Date(iso), "yyyy-MM-dd'T'HH:mm") : "";
const localInputToIso = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-t border-admin-hairline pt-5 first:border-0 first:pt-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-admin-ink-muted">
        {title}
      </p>
      {children}
    </section>
  );
}

export default function OfferModal({ isOpen, onClose, offer, onSuccess }: OfferModalProps) {
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [productOptions, setProductOptions] = useState<SelectOption[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productCategory, setProductCategory] = useState("");
  const [catLabels, setCatLabels] = useState<Record<string, string>>({});
  const [prodLabels, setProdLabels] = useState<Record<string, string>>({});

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key as string] ? { ...prev, [key]: "" } : prev));
  };

  // Load category options + an initial product page when the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    categoriesService
      .getCategories()
      .then((res) =>
        setCategoryOptions(
          (res.data.categories || []).map((c) => ({ value: c._id, label: c.categoryName }))
        )
      )
      .catch(() => {});
    searchProducts("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const searchProducts = (query: string, category: string = productCategory) => {
    setProductLoading(true);
    productsService
      .getProducts({
        search: query || undefined,
        category: category || undefined,
        limit: 50,
      })
      .then((res) =>
        setProductOptions(
          (res.data.products || []).map((p) => ({ value: p._id, label: p.productName }))
        )
      )
      .catch(() => {})
      .finally(() => setProductLoading(false));
  };

  // Re-scope the product picker to a category (and clear the text query).
  const handleProductCategoryChange = (category: string) => {
    setProductCategory(category);
    searchProducts("", category);
  };

  // Prefill on edit (refetch for fully-populated condition/targets).
  useEffect(() => {
    if (!isOpen) return;
    if (!offer) {
      setFormData(emptyForm);
      setErrors({});
      setCatLabels({});
      setProdLabels({});
      setProductCategory("");
      return;
    }
    const populate = (data: Offer) => {
      setFormData({
        title: data.title || "",
        description: data.description || "",
        isActive: data.isActive ?? true,
        imageUrl: data.image?.mediaUrl || "",
        offerType: data.offerType || "",
        minQuantity: data.condition?.minQuantity != null ? String(data.condition.minQuantity) : "",
        minAmount: data.condition?.minAmount != null ? String(data.condition.minAmount) : "",
        discountPercentage:
          data.reward?.discountPercentage != null ? String(data.reward.discountPercentage) : "",
        freeItemMaxValue:
          data.reward?.freeItemMaxValue != null ? String(data.reward.freeItemMaxValue) : "",
        excludedCategories: toIds(data.condition?.excludedCategories),
        targetProducts: toIds(data.targetProducts),
        startDate: isoToLocalInput(data.timing?.startDate),
        endDate: isoToLocalInput(data.timing?.endDate),
      });
      setCatLabels(toLabels(data.condition?.excludedCategories, "categoryName"));
      setProdLabels(toLabels(data.targetProducts, "productName"));
    };
    populate(offer);
    offersService
      .getOffer(offer._id)
      .then((res) => populate(res.data.offer))
      .catch(() => {});
    setErrors({});
  }, [offer, isOpen]);

  const handleImageUpload = (urls: any[]) => {
    if (urls.length > 0) setField("imageUrl", urls[0].mediaUrl);
  };

  const config = formData.offerType ? FIELD_CONFIG[formData.offerType] : undefined;

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!formData.title.trim()) e.title = "Title is required.";
    if (!formData.offerType) {
      e.offerType = "Select an offer type.";
      return e;
    }
    const cfg = FIELD_CONFIG[formData.offerType];
    if (cfg.minQuantity && !(Number(formData.minQuantity) >= 1))
      e.minQuantity = "Enter a quantity of at least 1.";
    if (cfg.minAmount && (formData.minAmount === "" || Number(formData.minAmount) < 0))
      e.minAmount = "Enter a minimum amount.";
    if (cfg.discountPercentage) {
      const n = Number(formData.discountPercentage);
      if (formData.discountPercentage === "" || n < 0 || n > 100)
        e.discountPercentage = "Enter a value between 0 and 100.";
    }
    if (cfg.freeItemMaxValue && (formData.freeItemMaxValue === "" || Number(formData.freeItemMaxValue) < 0))
      e.freeItemMaxValue = "Enter the maximum free-item value.";
    if (cfg.timing) {
      if (!formData.startDate) e.startDate = "Start date is required.";
      if (!formData.endDate) e.endDate = "End date is required.";
      if (
        formData.startDate &&
        formData.endDate &&
        new Date(formData.endDate) <= new Date(formData.startDate)
      )
        e.endDate = "End date must be after the start date.";
    }
    if (cfg.targetProducts && formData.targetProducts.length === 0)
      e.targetProducts = "Select at least one product.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const cfg = FIELD_CONFIG[formData.offerType as OfferType];
      const payload: CreateOfferDto = {
        title: formData.title.trim(),
        description: formData.description,
        isActive: formData.isActive,
        offerType: formData.offerType as OfferType,
      };

      // Image is optional — only send it when one was uploaded.
      if (formData.imageUrl) payload.image = { mediaUrl: formData.imageUrl };

      const condition: Record<string, any> = {};
      if (cfg.minQuantity) condition.minQuantity = Number(formData.minQuantity);
      if (cfg.minAmount) condition.minAmount = Number(formData.minAmount);
      if (cfg.excludedCategories) condition.excludedCategories = formData.excludedCategories;
      if (Object.keys(condition).length) payload.condition = condition;

      const reward: Record<string, any> = {};
      if (cfg.discountPercentage) reward.discountPercentage = Number(formData.discountPercentage);
      if (cfg.freeItemMaxValue) reward.freeItemMaxValue = Number(formData.freeItemMaxValue);
      if (Object.keys(reward).length) payload.reward = reward;

      if (cfg.timing)
        payload.timing = {
          startDate: localInputToIso(formData.startDate),
          endDate: localInputToIso(formData.endDate),
        };
      if (cfg.targetProducts) payload.targetProducts = formData.targetProducts;

      if (offer) {
        await offersService.updateOffer(offer._id, payload);
        toast.success("Offer updated successfully");
      } else {
        await offersService.createOffer(payload);
        toast.success("Offer created successfully");
      }
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(offer ? "Failed to update offer" : "Failed to create offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const meta = formData.offerType ? OFFER_TYPE_META[formData.offerType] : null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={offer ? "Edit Offer" : "Add New Offer"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Details */}
        <Section title="Details">
          <Field label="Title" htmlFor="offer-title" required error={errors.title}>
            <input
              id="offer-title"
              type="text"
              value={formData.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Spend 500, get 10% off"
              className={adminInputClass}
            />
          </Field>

          <Field label="Description" htmlFor="offer-description">
            <textarea
              id="offer-description"
              value={formData.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Optional — shown to customers…"
              rows={2}
              className={adminInputClass}
            />
          </Field>

          <Field label="Image" error={errors.image} hint="Optional — used on the storefront offer banner.">
            <ImageUpload folder="offers" onUpload={handleImageUpload} />
            {formData.imageUrl && (
              <Thumbnail src={formData.imageUrl} alt="Offer" className="mt-3 h-52 w-full" fit="contain" />
            )}
          </Field>
        </Section>

        {/* Offer type */}
        <Section title="Offer Type">
          <Field label="Type" htmlFor="offer-type" required error={errors.offerType}>
            <Select
              id="offer-type"
              ariaLabel="Offer type"
              value={formData.offerType}
              onChange={(v) => setField("offerType", v as OfferType)}
              options={TYPE_OPTIONS}
              placeholder="Choose how this offer rewards customers…"
              searchable
            />
          </Field>

          {meta && (
            <div className="rounded-lg bg-admin-gold-soft/60 p-3 text-sm ring-1 ring-admin-gold/30">
              <p className="font-medium text-admin-heading">{meta.label}</p>
              <p className="mt-1 text-admin-ink-muted">{meta.description}</p>
            </div>
          )}
        </Section>

        {/* Configuration */}
        {config && (
          <Section title="Configuration">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {config.minQuantity && (
                <Field
                  label="Minimum Quantity"
                  htmlFor="offer-min-quantity"
                  required
                  error={errors.minQuantity}
                  hint="Items the customer must buy to qualify."
                >
                  <input
                    id="offer-min-quantity"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={formData.minQuantity}
                    onChange={(e) => setField("minQuantity", e.target.value)}
                    placeholder="e.g. 3"
                    className={`${adminInputClass} tabular`}
                  />
                </Field>
              )}

              {config.minAmount && (
                <Field
                  label="Minimum Amount (EGP)"
                  htmlFor="offer-min-amount"
                  required
                  error={errors.minAmount}
                  hint="Cart subtotal needed to qualify."
                >
                  <input
                    id="offer-min-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    value={formData.minAmount}
                    onChange={(e) => setField("minAmount", e.target.value)}
                    placeholder="e.g. 500"
                    className={`${adminInputClass} tabular`}
                  />
                </Field>
              )}

              {config.discountPercentage && (
                <Field
                  label="Discount Percentage"
                  htmlFor="offer-discount"
                  required
                  error={errors.discountPercentage}
                  hint="0–100% off."
                >
                  <input
                    id="offer-discount"
                    type="number"
                    min={0}
                    max={100}
                    inputMode="numeric"
                    value={formData.discountPercentage}
                    onChange={(e) => setField("discountPercentage", e.target.value)}
                    placeholder="e.g. 10"
                    className={`${adminInputClass} tabular`}
                  />
                </Field>
              )}

              {config.freeItemMaxValue && (
                <Field
                  label="Free Item Max Value (EGP)"
                  htmlFor="offer-free-item-max"
                  required
                  error={errors.freeItemMaxValue}
                  hint="Most the free gift can be worth."
                >
                  <input
                    id="offer-free-item-max"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    value={formData.freeItemMaxValue}
                    onChange={(e) => setField("freeItemMaxValue", e.target.value)}
                    placeholder="e.g. 150"
                    className={`${adminInputClass} tabular`}
                  />
                </Field>
              )}
            </div>

            {config.excludedCategories && (
              <Field
                label="Excluded Categories"
                hint="Items in these categories ship normally but don't count toward qualifying."
              >
                <MultiSelect
                  ariaLabel="Excluded categories"
                  values={formData.excludedCategories}
                  onChange={(v) => setField("excludedCategories", v)}
                  options={categoryOptions}
                  labelMap={catLabels}
                  placeholder="Select categories to exclude…"
                  searchPlaceholder="Search categories…"
                  emptyText="No categories"
                />
              </Field>
            )}
          </Section>
        )}

        {/* Schedule */}
        {config?.timing && (
          <Section title="Schedule">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Start Date" htmlFor="offer-start-date" required error={errors.startDate}>
                <input
                  id="offer-start-date"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setField("startDate", e.target.value)}
                  className={adminInputClass}
                />
              </Field>
              <Field label="End Date" htmlFor="offer-end-date" required error={errors.endDate}>
                <input
                  id="offer-end-date"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setField("endDate", e.target.value)}
                  className={adminInputClass}
                />
              </Field>
            </div>
          </Section>
        )}

        {/* Targeting */}
        {config?.targetProducts && (
          <Section title="Targeting">
            <Field
              label="Target Products"
              required
              error={errors.targetProducts}
              hint="The products this flash sale applies to. Filter by category to narrow the list."
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[13rem_1fr]">
                <Select
                  ariaLabel="Filter products by category"
                  value={productCategory}
                  onChange={handleProductCategoryChange}
                  options={[
                    { value: "", label: "All categories" },
                    ...categoryOptions,
                  ]}
                  placeholder="All categories"
                  searchable
                />
                <MultiSelect
                  ariaLabel="Target products"
                  values={formData.targetProducts}
                  onChange={(v) => setField("targetProducts", v)}
                  options={productOptions}
                  labelMap={prodLabels}
                  onSearch={(q) => searchProducts(q, productCategory)}
                  loading={productLoading}
                  placeholder="Select products…"
                  searchPlaceholder="Search products by name…"
                  emptyText="No products found"
                />
              </div>
            </Field>
          </Section>
        )}

        {/* Status */}
        <Section title="Status">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-admin-ink">Active</p>
              <p className="text-xs text-admin-ink-muted">
                Inactive offers are saved but never applied at checkout.
              </p>
            </div>
            <Toggle
              label="Active"
              checked={formData.isActive}
              onChange={(v) => setField("isActive", v)}
            />
          </div>
        </Section>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {offer ? "Save Changes" : "Create Offer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
