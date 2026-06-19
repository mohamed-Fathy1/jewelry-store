"use client";

import { useState, useEffect } from "react";
import { TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { HeroSlider } from "@/types/hero.types";
import { adminService } from "@/services/admin.service";
import {
  Card,
  Button,
  IconButton,
  Skeleton,
  EmptyState,
  ConfirmDialog,
} from "@/components/admin/ui";
import toast from "react-hot-toast";

interface HeroListProps {
  onEdit: (slider: HeroSlider) => void;
}

export default function HeroList({ onEdit }: HeroListProps) {
  const [sliders, setSliders] = useState<HeroSlider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<HeroSlider | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSliders = async () => {
    try {
      const response = await adminService.getHeroSliders();
      setSliders(response.data.imageSlider);
    } catch (error) {
      toast.error("Failed to fetch hero sliders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await adminService.deleteHeroSlider(pendingDelete._id);
      toast.success("Slider deleted successfully");
      setPendingDelete(null);
      fetchSliders();
    } catch (error) {
      toast.error("Failed to delete slider");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!sliders || sliders.length === 0) {
    return (
      <EmptyState
        icon={PhotoIcon}
        title="No hero slides"
        description="Add a slide to feature on the storefront homepage."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        {sliders.map((slider) => (
          <Card key={slider._id}>
            <div className="grid grid-cols-2 gap-6">
              {/* Small Image */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-admin-ink">
                  Small Image
                </h3>
                <div className="relative h-48 overflow-hidden rounded-lg">
                  <Image
                    src={slider.images.image1.mediaUrl}
                    alt="Small hero image"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Large Image */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-admin-ink">
                  Large Image
                </h3>
                <div className="relative h-48 overflow-hidden rounded-lg">
                  <Image
                    src={slider.images.image2.mediaUrl}
                    alt="Large hero image"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => onEdit(slider)}>
                Edit
              </Button>
              <IconButton
                label="Delete slide"
                icon={<TrashIcon />}
                variant="danger"
                onClick={() => setPendingDelete(slider)}
              />
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete slide"
        description="This hero slide will be permanently removed from the storefront homepage."
        confirmLabel="Delete"
        danger
        loading={isDeleting}
      />
    </>
  );
}
