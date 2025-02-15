"use client";

import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { colors } from "@/constants/colors";
import { HeroSlider } from "@/types/hero.types";
import { adminService } from "@/services/admin.service";
import toast from "react-hot-toast";

interface HeroListProps {
  onEdit: (slider: HeroSlider) => void;
}

export default function HeroList({ onEdit }: HeroListProps) {
  const [sliders, setSliders] = useState<HeroSlider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this slider?")) {
      try {
        await adminService.deleteHeroSlider(id);
        toast.success("Slider deleted successfully");
        fetchSliders();
      } catch (error) {
        toast.error("Failed to delete slider");
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 gap-6">
      {sliders.map((slider) => (
        <div key={slider._id} className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Small Image */}
            <div>
              <h3 className="text-sm font-medium mb-2">Small Image</h3>
              <div className="relative h-48 rounded-lg overflow-hidden">
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
              <h3 className="text-sm font-medium mb-2">Large Image</h3>
              <div className="relative h-48 rounded-lg overflow-hidden">
                <Image
                  src={slider.images.image2.mediaUrl}
                  alt="Large hero image"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => onEdit(slider)}
              className="text-indigo-600 hover:text-indigo-900"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleDelete(slider._id)}
              className="text-red-600 hover:text-red-900"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 