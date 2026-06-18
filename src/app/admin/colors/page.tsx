"use client";

import { useState, useRef } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import ColorList, { ColorListRef } from "@/components/admin/colors/ColorList";
import ColorModal from "@/components/admin/colors/ColorModal";
import { Color } from "@/types/color.types";
import { colors } from "@/constants/colors";

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
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: colors.textPrimary }}
        >
          Colors
        </h1>
        <button
          onClick={handleAddColor}
          className="flex items-center px-4 py-2 rounded-md text-white"
          style={{ backgroundColor: colors.brown }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Color
        </button>
      </div>

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
