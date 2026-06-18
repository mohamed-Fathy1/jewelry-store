"use client";

import { useState, useRef } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import IconList, { IconListRef } from "@/components/admin/icons/IconList";
import IconModal from "@/components/admin/icons/IconModal";
import { Icon } from "@/types/icon.types";
import { colors } from "@/constants/colors";

export default function IconsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const listRef = useRef<IconListRef>(null);

  const handleAddIcon = () => {
    setSelectedIcon(null);
    setIsModalOpen(true);
  };

  const handleEditIcon = (icon: Icon) => {
    setSelectedIcon(icon);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    listRef.current?.fetchIcons();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: colors.textPrimary }}
        >
          Icons
        </h1>
        <button
          onClick={handleAddIcon}
          className="flex items-center px-4 py-2 rounded-md text-white"
          style={{ backgroundColor: colors.brown }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Icon
        </button>
      </div>

      <IconList ref={listRef} onEdit={handleEditIcon} />

      <IconModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        icon={selectedIcon}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
