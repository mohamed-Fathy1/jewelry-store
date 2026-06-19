"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import {
  AdminProduct,
  CreateProductDto,
  VariantInput,
} from "@/types/admin-product.types";
import { Category } from "@/types/category.types";
import { Color } from "@/types/color.types";
import { Size } from "@/types/size.types";
import { productsService } from "@/services/products.service";
import { categoryService } from "@/services/category.service";
import { colorsService } from "@/services/colors.service";
import { sizesService } from "@/services/sizes.service";
import { Select } from "@/components/ui/Select";
import { Button, IconButton, Thumbnail, adminInputClass } from "@/components/admin/ui";
import ImageUpload from "./ImageUpload";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: AdminProduct | null;
  onSuccess?: () => void;
}

const inputClass = `${adminInputClass} mt-1`;

const labelClass = "block text-sm font-medium text-admin-ink";

// A titled, card-like section to group related fields within the modal.
function FormSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-admin-hairline bg-admin-surface p-4 sm:p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-admin-heading">{title}</h3>
          {description && (
            <p className="text-xs text-admin-ink-muted mt-0.5">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

interface VariantRow {
  _id?: string;
  color: string;
  size: string;
  availableItems: string;
}

const emptyForm = {
  productName: "",
  productDescription: "",
  price: "",
  salePrice: "",
  wholesalePrice: "",
  availableItems: "",
  categoryId: "",
  defaultImage: "",
  isBestSeller: false,
};

type FormState = typeof emptyForm;

const idOf = (value: unknown): string =>
  typeof value === "object" && value
    ? (value as { _id: string })._id
    : (value as string) || "";

export default function ProductModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: ProductModalProps) {
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [colorOptions, setColorOptions] = useState<Color[]>([]);
  const [sizeOptions, setSizeOptions] = useState<Size[]>([]);

  // Load reference data once the modal opens.
  useEffect(() => {
    if (!isOpen) return;

    categoryService
      .getAllCategories()
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => {});
    colorsService
      .getColors()
      .then((res) => setColorOptions(res.data.data || []))
      .catch(() => {});
    sizesService
      .getSizes()
      .then((res) => setSizeOptions(res.data.data || []))
      .catch(() => {});
  }, [isOpen]);

  // Prefill / reset whenever the target product changes.
  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      const populate = (data: AdminProduct) => {
        setFormData({
          productName: data.productName || "",
          productDescription: data.productDescription || "",
          price: data.price != null ? String(data.price) : "",
          salePrice: data.salePrice != null ? String(data.salePrice) : "",
          wholesalePrice:
            data.wholesalePrice != null ? String(data.wholesalePrice) : "",
          availableItems:
            data.availableItems != null ? String(data.availableItems) : "",
          categoryId: idOf(data.category),
          defaultImage: data.defaultImage?.mediaUrl || "",
          isBestSeller: data.isBestSeller ?? false,
        });
        setAlbumImages((data.albumImages || []).map((m) => m.mediaUrl));
        setVariants(
          (data.variants || []).map((v) => ({
            _id: v._id,
            color: idOf(v.color),
            size: idOf(v.size),
            availableItems: String(v.availableItems ?? ""),
          }))
        );
      };

      populate(product);
      // Refetch for the complete, populated product (variants included).
      productsService
        .getProduct(product._id)
        .then((res) => populate(res.data.product))
        .catch(() => {});
    } else {
      setFormData(emptyForm);
      setAlbumImages([]);
      setVariants([]);
    }
  }, [product, isOpen]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // Album image rows (upload-only; remove a previously uploaded image)
  const removeAlbumImage = (index: number) =>
    setAlbumImages((prev) => prev.filter((_, i) => i !== index));

  // AWS S3 upload. `ImageUpload` returns the presigned-upload result objects;
  // each one's `mediaUrl` is the final public URL we store in the field.
  const handleDefaultImageUpload = (urls: string[]) => {
    const media = urls as unknown as { mediaUrl: string }[];
    if (media[0]?.mediaUrl) {
      setField("defaultImage", media[0].mediaUrl);
    }
  };

  const handleAlbumImagesUpload = (urls: string[]) => {
    const media = urls as unknown as { mediaUrl: string }[];
    const newUrls = media.map((m) => m?.mediaUrl).filter(Boolean);
    if (newUrls.length) {
      setAlbumImages((prev) => [...prev, ...newUrls]);
    }
  };

  // Variant rows
  const addVariant = () =>
    setVariants((prev) => [
      ...prev,
      { color: "", size: "", availableItems: "" },
    ]);
  const updateVariant = (
    index: number,
    key: keyof VariantRow,
    value: string
  ) =>
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [key]: value } : v))
    );
  const removeVariant = async (index: number) => {
    const variant = variants[index];
    // Existing variant -> delete server-side; new row -> just drop it.
    if (variant._id && product) {
      if (!window.confirm("Delete this variant?")) return;
      try {
        await productsService.deleteVariant(product._id, variant._id);
        toast.success("Variant deleted successfully");
      } catch (error) {
        toast.error("Failed to delete variant");
        return;
      }
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(formData.price);
    const salePrice = formData.salePrice
      ? parseFloat(formData.salePrice)
      : undefined;
    const wholesalePrice = formData.wholesalePrice
      ? parseFloat(formData.wholesalePrice)
      : undefined;
    const finalPrice = salePrice ?? price;

    if (wholesalePrice !== undefined && wholesalePrice >= finalPrice) {
      toast.error("Wholesale price must be less than the final selling price");
      return;
    }

    // Only keep fully-specified variant rows.
    const variantPayload: VariantInput[] = variants
      .filter((v) => v.color && v.size)
      .map((v) => ({
        ...(v._id ? { _id: v._id } : {}),
        color: v.color,
        size: v.size,
        availableItems: parseInt(v.availableItems || "0", 10),
      }));

    setIsSubmitting(true);
    try {
      const payload: CreateProductDto = {
        productName: formData.productName,
        productDescription: formData.productDescription,
        price,
        availableItems: parseInt(formData.availableItems || "0", 10),
        categoryId: formData.categoryId,
        defaultImage: formData.defaultImage,
        salePrice,
        wholesalePrice,
        albumImages: albumImages.map((url) => url.trim()).filter(Boolean),
        isBestSeller: formData.isBestSeller,
        ...(variantPayload.length ? { variants: variantPayload } : {}),
      };

      if (product) {
        await productsService.updateProduct(product._id, payload);
        toast.success("Product updated successfully");
      } else {
        await productsService.createProduct(payload);
        toast.success("Product created successfully");
      }

      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(
        product ? "Failed to update product" : "Failed to create product"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="admin-theme fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay
          className="fixed inset-0"
          style={{ backgroundColor: "var(--admin-overlay)" }}
        />

        <div className="relative bg-admin-surface rounded-xl ring-1 ring-admin-hairline shadow-admin-popover w-full max-w-3xl mx-auto p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold text-admin-heading">
              {product ? "Edit Product" : "Add New Product"}
            </Dialog.Title>
            <IconButton
              label="Close"
              icon={<XMarkIcon />}
              onClick={onClose}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ---- Basic Information ---- */}
            <FormSection
              title="Basic Information"
              description="Name, description and how this product is categorized."
            >
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Product Name</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setField("productName", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Gold Hoop Earrings"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={formData.productDescription}
                    onChange={(e) =>
                      setField("productDescription", e.target.value)
                    }
                    placeholder="Describe the product…"
                    rows={3}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Category</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setField("categoryId", e.target.value)}
                      className={inputClass}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Available Items</label>
                    <input
                      type="number"
                      value={formData.availableItems}
                      onChange={(e) =>
                        setField("availableItems", e.target.value)
                      }
                      placeholder="0"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border border-admin-hairline px-3 py-2.5">
                  <div>
                    <span className="block text-sm font-medium text-admin-ink">
                      Best Seller
                    </span>
                    <span className="block text-xs text-admin-ink-muted">
                      Feature this product as a best seller
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.isBestSeller}
                    onClick={() =>
                      setField("isBestSeller", !formData.isBestSeller)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0 ${
                      formData.isBestSeller
                        ? "bg-admin-brown"
                        : "bg-admin-hairline"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-admin-surface transition-transform ${
                        formData.isBestSeller
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </FormSection>

            {/* ---- Pricing ---- */}
            <FormSection
              title="Pricing"
              description="All prices are in EGP. Wholesale must be below the final price."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setField("price", e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Sale Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setField("salePrice", e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Wholesale Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.wholesalePrice}
                    onChange={(e) => setField("wholesalePrice", e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                  <p className="text-xs text-admin-ink-muted mt-1">
                    Must be less than the final selling price.
                  </p>
                </div>
              </div>
            </FormSection>

            {/* ---- Images ---- */}
            <FormSection
              title="Images"
              description="Upload a default image and optional album images."
            >
              <div className="space-y-5">
                <div>
                  <label className={`${labelClass} mb-2`}>Default Image</label>
                  <ImageUpload onUpload={handleDefaultImageUpload} />

                  {formData.defaultImage && (
                    <div className="mt-3 relative inline-block">
                      <Thumbnail
                        src={formData.defaultImage}
                        alt="Default"
                        className="h-24 w-24"
                      />
                      <button
                        type="button"
                        onClick={() => setField("defaultImage", "")}
                        className="absolute -top-2 -right-2 bg-admin-danger text-admin-on-accent rounded-full p-1 hover:bg-admin-danger-hover"
                        title="Remove image"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className={`${labelClass} mb-2`}>Album Images</label>
                  <ImageUpload onUpload={handleAlbumImagesUpload} />

                  {albumImages.length === 0 ? (
                    <p className="text-xs text-admin-ink-muted mt-2">
                      No album images yet. Upload to add.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                      {albumImages.map((url, index) =>
                        url ? (
                          <div key={index} className="relative">
                            <Thumbnail
                              src={url}
                              alt={`Album ${index + 1}`}
                              className="h-24 w-full"
                            />
                            <button
                              type="button"
                              onClick={() => removeAlbumImage(index)}
                              className="absolute -top-2 -right-2 bg-admin-danger text-admin-on-accent rounded-full p-1 hover:bg-admin-danger-hover"
                              title="Remove image"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              </div>
            </FormSection>

            {/* ---- Variants ---- */}
            <FormSection
              title="Variants"
              description="Color, size and stock combinations for this product."
              action={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addVariant}
                  leftIcon={<PlusIcon className="h-4 w-4" />}
                >
                  Add Variant
                </Button>
              }
            >
              {variants.length === 0 ? (
                <div className="text-center py-8 px-4 border-2 border-dashed border-admin-hairline rounded-lg">
                  <p className="text-sm text-admin-ink-muted">
                    No variants added yet. Click{" "}
                    <span className="font-medium">+ Add Variant</span> to begin.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <div
                      key={variant._id ?? `new-${index}`}
                      className="rounded-lg border border-admin-hairline bg-admin-surface-muted p-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div className="sm:col-span-5">
                          <label className="block text-xs font-medium text-admin-ink-muted">
                            Color
                          </label>
                          <Select
                            value={variant.color}
                            onChange={(value) =>
                              updateVariant(index, "color", value)
                            }
                            placeholder="Select color"
                            className={inputClass}
                            options={colorOptions.map((color) => ({
                              value: color._id,
                              label: color.name,
                              swatch: color.hex,
                            }))}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-medium text-admin-ink-muted">
                            Size
                          </label>
                          <select
                            value={variant.size}
                            onChange={(e) =>
                              updateVariant(index, "size", e.target.value)
                            }
                            className={inputClass}
                          >
                            <option value="">Select size</option>
                            {sizeOptions.map((size) => (
                              <option key={size._id} value={size._id}>
                                {size.number}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-medium text-admin-ink-muted">
                            Available Items
                          </label>
                          <input
                            type="number"
                            value={variant.availableItems}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "availableItems",
                                e.target.value
                              )
                            }
                            placeholder="Qty"
                            className={inputClass}
                          />
                        </div>
                        <div className="sm:col-span-1 flex justify-end pb-1">
                          <IconButton
                            label="Delete variant"
                            icon={<TrashIcon />}
                            variant="danger"
                            onClick={() => removeVariant(index)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </FormSection>

            <div className="flex justify-end space-x-3 pt-1">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                {isSubmitting
                  ? "Saving…"
                  : product
                  ? "Update Product"
                  : "Create Product"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
