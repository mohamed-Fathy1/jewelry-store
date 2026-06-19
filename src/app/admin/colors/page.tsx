"use client";

import { useState, useRef } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import ColorList, { ColorListRef } from "@/components/admin/colors/ColorList";
import ColorModal from "@/components/admin/colors/ColorModal";
import { Color } from "@/types/color.types";
import { Button, PageHeader } from "@/components/admin/ui";

export default function ColorsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const listRef = useRef<ColorListRef>(null);

  const handleAddColor = () => {
    setSelectedColor(null);
    setIsModalOpen(true);
  };

  const handleEditColor = (color: Color) => {
    setSelectedColor(color);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    listRef.current?.fetchColors();
  };

  return (
    <div>
      <PageHeader
        title="Colors"
        description="Manage the color options shown on products."
        actions={
          <Button onClick={handleAddColor} leftIcon={<PlusIcon className="h-5 w-5" />}>
            Add Color
          </Button>
        }
      />

      <ColorList ref={listRef} onEdit={handleEditColor} />

      <ColorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        color={selectedColor}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
