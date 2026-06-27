"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import HeroList from "@/components/admin/hero/HeroList";
import HeroModal from "@/components/admin/hero/HeroModal";
import { HeroSlider } from "@/types/hero.types";
import { Button, PageHeader } from "@/components/admin/ui";

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
      <PageHeader
        title="Hero Section"
        description="Manage the slides featured on the storefront homepage."
        actions={
          <Button onClick={handleAddSlider} leftIcon={<PlusIcon className="h-5 w-5" />}>
            Add Slider
          </Button>
        }
      />

      <HeroList onEdit={handleEditSlider} />

      <HeroModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slider={selectedSlider}
      />
    </div>
  );
}
