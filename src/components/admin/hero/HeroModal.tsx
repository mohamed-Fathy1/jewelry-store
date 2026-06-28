"use client";

import { useState, useEffect } from "react";
import { HeroSlider } from "@/types/hero.types";
import { adminService } from "@/services/admin.service";
import toast from "react-hot-toast";
import ImageUpload from "../products/ImageUpload";
import { Modal, Field, Button, Thumbnail } from "@/components/admin/ui";

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

  // uploadImages resolves to the presign objects; each one's `mediaUrl` is the
  // final public (CloudFront) URL we store and send — not the whole object.
  const handleSmallImageUpload = (urls: string[]) => {
    const media = urls as unknown as { mediaUrl: string }[];
    if (media[0]?.mediaUrl) {
      setFormData((prev) => ({
        ...prev,
        smallImage: media[0].mediaUrl,
      }));
    }
  };

  const handleLargeImageUpload = (urls: string[]) => {
    const media = urls as unknown as { mediaUrl: string }[];
    if (media[0]?.mediaUrl) {
      setFormData((prev) => ({
        ...prev,
        largeImage: media[0].mediaUrl,
      }));
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={slider ? "Edit Hero Slider" : "Add New Hero Slider"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Small Image Upload */}
        <Field label="Small Image" htmlFor="hero-small-image">
          <ImageUpload onUpload={handleSmallImageUpload} />
          {formData.smallImage && (
            <Thumbnail
              src={formData.smallImage}
              alt="Small preview"
              className="mt-2 h-52 w-full"
              rounded="rounded-lg"
              fit="contain"
            />
          )}
        </Field>

        {/* Large Image Upload */}
        <Field label="Large Image" htmlFor="hero-large-image">
          <ImageUpload onUpload={handleLargeImageUpload} />
          {formData.largeImage && (
            <Thumbnail
              src={formData.largeImage}
              alt="Large preview"
              className="mt-2 h-52 w-full"
              rounded="rounded-lg"
              fit="contain"
            />
          )}
        </Field>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
