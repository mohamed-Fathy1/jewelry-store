"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { HeroSlider } from "@/types/hero.types";
import { adminService } from "@/services/admin.service";
import toast from "react-hot-toast";
import { colors } from "@/constants/colors";
import ImageUpload from "../products/ImageUpload";

interface HeroModalProps {
  isOpen: boolean;
  onClose: () => void;
  slider?: HeroSlider | null;
}

export default function HeroModal({ isOpen, onClose, slider }: HeroModalProps) {
  const [formData, setFormData] = useState({
    smallImage: "",
    largeImage: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (slider) {
      setFormData({
        smallImage: slider.images.image1.mediaUrl,
        largeImage: slider.images.image2.mediaUrl,
      });
    } else {
      setFormData({
        smallImage: "",
        largeImage: "",
      });
    }
  }, [slider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const images = {
        image1: {
          imageUrl: formData.smallImage,
          imageType: "small" as const,
        },
        image2: {
          imageUrl: formData.largeImage,
          imageType: "large" as const,
        },
      };

      if (slider) {
        await adminService.updateHeroSlider(slider._id, images);
        toast.success("Hero slider updated successfully");
      } else {
        await adminService.createHeroSlider(images);
        toast.success("Hero slider created successfully");
      }

      onClose();
      window.location.reload();
    } catch (error) {
      toast.error(
        slider ? "Failed to update hero slider" : "Failed to create hero slider"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSmallImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData((prev) => ({
        ...prev,
        smallImage: urls[0],
      }));
    }
  };

  const handleLargeImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData((prev) => ({
        ...prev,
        largeImage: urls[0],
      }));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-2xl mx-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title
              className="text-xl font-semibold"
              style={{ color: colors.textPrimary }}
            >
              {slider ? "Edit Hero Slider" : "Add New Hero Slider"}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Small Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Small Image
              </label>
              <ImageUpload onUpload={handleSmallImageUpload} />
              {formData.smallImage && (
                <div className="mt-2">
                  <img
                    src={formData.smallImage}
                    alt="Small preview"
                    className="h-32 w-full object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Large Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Large Image
              </label>
              <ImageUpload onUpload={handleLargeImageUpload} />
              {formData.largeImage && (
                <div className="mt-2">
                  <img
                    src={formData.largeImage}
                    alt="Large preview"
                    className="h-32 w-full object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
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
                {isSubmitting ? "Saving..." : slider ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
