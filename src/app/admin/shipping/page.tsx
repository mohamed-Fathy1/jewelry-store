"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import ShippingList from "@/components/admin/shipping/ShippingList";
import ShippingModal from "@/components/admin/shipping/ShippingModal";
import { Shipping } from "@/types/shipping.types";
import { Button, PageHeader } from "@/components/admin/ui";

export default function ShippingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<Shipping | null>(
    null
  );

  const handleAddShipping = () => {
    setSelectedShipping(null);
    setIsModalOpen(true);
  };

  const handleEditShipping = (shipping: Shipping) => {
    setSelectedShipping(shipping);
    setIsModalOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Shipping Options"
        description="Manage delivery regions and their costs."
        actions={
          <Button onClick={handleAddShipping} leftIcon={<PlusIcon className="h-5 w-5" />}>
            Add Shipping Option
          </Button>
        }
      />

      <ShippingList onEdit={handleEditShipping} />

      <ShippingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shipping={selectedShipping}
      />
    </div>
  );
}
