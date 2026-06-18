"use client";

import { useState, useRef } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import OfferList, { OfferListRef } from "@/components/admin/offers/OfferList";
import OfferModal from "@/components/admin/offers/OfferModal";
import { Offer } from "@/types/offer.types";
import { colors } from "@/constants/colors";

export default function OffersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const listRef = useRef<OfferListRef>(null);

  const handleAddOffer = () => {
    setSelectedOffer(null);
    setIsModalOpen(true);
  };

  const handleEditOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    listRef.current?.fetchOffers();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: colors.textPrimary }}
        >
          Offers
        </h1>
        <button
          onClick={handleAddOffer}
          className="flex items-center px-4 py-2 rounded-md text-white"
          style={{ backgroundColor: colors.brown }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Offer
        </button>
      </div>

      <OfferList ref={listRef} onEdit={handleEditOffer} />

      <OfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        offer={selectedOffer}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
