"use client";

import { useState, useRef } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import SizeList, { SizeListRef } from "@/components/admin/sizes/SizeList";
import SizeModal from "@/components/admin/sizes/SizeModal";
import { Size } from "@/types/size.types";
import { colors } from "@/constants/colors";

export default function SizesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const listRef = useRef<SizeListRef>(null);

  const handleAddSize = () => {
    setSelectedSize(null);
    setIsModalOpen(true);
  };

  const handleEditSize = (size: Size) => {
    setSelectedSize(size);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    listRef.current?.fetchSizes();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: colors.textPrimary }}
        >
          Sizes
        </h1>
        <button
          onClick={handleAddSize}
          className="flex items-center px-4 py-2 rounded-md text-white"
          style={{ backgroundColor: colors.brown }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Size
        </button>
      </div>

      <SizeList ref={listRef} onEdit={handleEditSize} />

      <SizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size={selectedSize}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
