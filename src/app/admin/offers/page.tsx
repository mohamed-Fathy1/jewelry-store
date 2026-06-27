"use client";

import { useState, useRef } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import OfferList, { OfferListRef } from "@/components/admin/offers/OfferList";
import OfferModal from "@/components/admin/offers/OfferModal";
import { Offer } from "@/types/offer.types";
import { Button, PageHeader } from "@/components/admin/ui";

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
      <PageHeader
        title="Offers"
        description="Create and manage promotional offers for the store."
        actions={
          <Button onClick={handleAddOffer} leftIcon={<PlusIcon className="h-5 w-5" />}>
            Add Offer
          </Button>
        }
      />

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
