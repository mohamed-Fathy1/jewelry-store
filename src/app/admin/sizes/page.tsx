"use client";

import { useState, useRef } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import SizeList, { SizeListRef } from "@/components/admin/sizes/SizeList";
import SizeModal from "@/components/admin/sizes/SizeModal";
import { Size } from "@/types/size.types";
import { Button, PageHeader } from "@/components/admin/ui";

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
      <PageHeader
        title="Sizes"
        description="Manage the size options shown on products."
        actions={
          <Button onClick={handleAddSize} leftIcon={<PlusIcon className="h-5 w-5" />}>
            Add Size
          </Button>
        }
      />

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
