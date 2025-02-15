"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import ShippingList from "@/components/admin/shipping/ShippingList";
import ShippingModal from "@/components/admin/shipping/ShippingModal";
import { colors } from "@/constants/colors";
import { Shipping } from "@/types/shipping.types";

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
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: colors.textPrimary }}
        >
          Shipping Options
        </h1>
        <button
          onClick={handleAddShipping}
          className="flex items-center px-4 py-2 rounded-md text-white"
          style={{ backgroundColor: colors.brown }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Shipping Option
        </button>
      </div>

      <ShippingList onEdit={handleEditShipping} />

      <ShippingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shipping={selectedShipping}
      />
    </div>
  );
}
