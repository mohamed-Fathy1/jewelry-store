"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Product } from "@/types/product.types";
import { adminService } from "@/services/admin.service";
import toast from "react-hot-toast";
import { colors } from "@/constants/colors";
import ImageUpload from "./ImageUpload";
import { categoryService } from "@/services/category.service";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

interface CreateProductData {
  productName: string;
  productDescription: string;
  price: number;
  availableItems: number;
  salePrice?: number;
  expiredSale?: string;
  categoryId: string;
  defaultImage: string;
  albumImages: string[];
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
}: ProductModalProps) {
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    price: "",
    availableItems: "",
    salePrice: "",
    expiredSale: null as Date | null,
    categoryId: "",
    defaultImage: "",
    albumImages: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName,
        productDescription: product.productDescription || "",
        price: product.price.toString(),
        availableItems: product.availableItems.toString(),
        salePrice: product.salePrice?.toString() || "",
        expiredSale: product.expiredSale ? new Date(product.expiredSale) : null,
        categoryId: product.category?._id,
        defaultImage: product.defaultImage,
        albumImages: product.albumImages || [],
      });
    } else {
      setFormData({
        productName: "",
        productDescription: "",
        price: "",
        availableItems: "",
        salePrice: "",
        expiredSale: null,
        categoryId: "",
        defaultImage: "",
        albumImages: [],
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData: CreateProductData = {
        productName: formData.productName,
        productDescription: formData.productDescription,
        price: parseFloat(formData.price),
        availableItems: parseInt(formData.availableItems),
        salePrice: formData.salePrice
          ? parseFloat(formData.salePrice)
          : undefined,
        expiredSale: formData.expiredSale
          ? formData.expiredSale.getTime().toString()
          : undefined,
        categoryId: formData.categoryId,
        defaultImage: formData.albumImages[0].mediaUrl || "",
        albumImages: formData.albumImages.map((media) => media.mediaUrl),
      };

      if (product) {
        await adminService.updateProduct(product._id, productData);
        toast.success("Product updated successfully");
      } else {
        await adminService.createProduct(productData);
        toast.success("Product created successfully");
      }

      onClose();
    } catch (error) {
      toast.error(
        product ? "Failed to update product" : "Failed to create product"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (urls: string[]) => {
    setFormData((prev) => ({
      ...prev,
      albumImages: [...prev.albumImages, ...urls],
      defaultImage: prev.albumImages.length === 0 ? urls[0] : prev.defaultImage,
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      albumImages: prev.albumImages.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-3xl mx-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title
              className="text-xl font-semibold"
              style={{ color: colors.textPrimary }}
            >
              {product ? "Edit Product" : "Add New Product"}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Product Name
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    productName: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.productDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    productDescription: e.target.value,
                  }))
                }
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sale Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salePrice: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Available Items
                </label>
                <input
                  type="number"
                  value={formData.availableItems}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      availableItems: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Expiry Date
                </label>
                <DatePicker
                  selected={formData.expiredSale}
                  onChange={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      expiredSale: date,
                    }))
                  }
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown"
                  placeholderText="Select date and time"
                  minDate={new Date()}
                  isClearable
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown focus:ring-brown"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option
                    key={category._id}
                    value={category._id}
                    selected={category._id === formData.categoryId}
                  >
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              <ImageUpload onUpload={handleImageUpload} />

              <div className="grid grid-cols-4 gap-4 mt-4">
                {formData.albumImages.map((url, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={url.mediaUrl}
                      alt={`Product ${index + 1}`}
                      width={96}
                      height={96}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: colors.brown }}
              >
                {isSubmitting
                  ? "Saving..."
                  : product
                  ? "Update Product"
                  : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
