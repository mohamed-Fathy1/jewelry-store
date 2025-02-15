"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import HeroList from "@/components/admin/hero/HeroList";
import HeroModal from "@/components/admin/hero/HeroModal";
import { colors } from "@/constants/colors";
import { HeroSlider } from "@/types/hero.types";

export default function HeroPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState<HeroSlider | null>(null);

  const handleAddSlider = () => {
    setSelectedSlider(null);
    setIsModalOpen(true);
  };

  const handleEditSlider = (slider: HeroSlider) => {
    setSelectedSlider(slider);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: colors.textPrimary }}
        >
          Hero Section
        </h1>
        <button
          onClick={handleAddSlider}
          className="flex items-center px-4 py-2 rounded-md text-white"
          style={{ backgroundColor: colors.brown }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Slider
        </button>
      </div>

      <HeroList onEdit={handleEditSlider} />

      <HeroModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slider={selectedSlider}
      />
    </div>
  );
}
