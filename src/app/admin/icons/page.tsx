"use client";

import { useState, useRef } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import IconList, { IconListRef } from "@/components/admin/icons/IconList";
import IconModal from "@/components/admin/icons/IconModal";
import { Icon } from "@/types/icon.types";
import { Button, PageHeader } from "@/components/admin/ui";

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
      <PageHeader
        title="Icons"
        description="Manage the icons available across the storefront."
        actions={
          <Button onClick={handleAddIcon} leftIcon={<PlusIcon className="h-5 w-5" />}>
            Add Icon
          </Button>
        }
      />

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
