"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { PencilIcon, TrashIcon, TagIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { Offer, OfferType } from "@/types/offer.types";
import { offersService } from "@/services/offers.service";
import {
  TableShell,
  Thead,
  Tbody,
  Th,
  Td,
  Tr,
  IconButton,
  Pagination,
  SkeletonTable,
  EmptyState,
  Badge,
  StatusBadge,
  ConfirmDialog,
  adminInputClass,
} from "@/components/admin/ui";
import toast from "react-hot-toast";

interface OfferListProps {
  onEdit: (offer: Offer) => void;
}

export interface OfferListRef {
  fetchOffers: () => Promise<void>;
}

export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  buy_x_get_cheapest_free: "Buy X, Cheapest Free",
  spend_x_get_discount: "Spend X, Get Discount",
  spend_x_get_free_shipping: "Spend X, Free Shipping",
  buy_x_get_free_shipping: "Buy X, Free Shipping",
  buy_x_get_half_price: "Buy X, Half Price",
  spend_x_get_free_item: "Spend X, Free Item",
  flash_sale: "Flash Sale",
};

const OFFER_TYPES = Object.keys(OFFER_TYPE_LABELS) as OfferType[];

const OfferList = forwardRef<OfferListRef, OfferListProps>(({ onEdit }, ref) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState<OfferType | "">("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [pendingDelete, setPendingDelete] = useState<Offer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOffers = async (page: number = currentPage) => {
    setIsLoading(true);
    try {
      const response = await offersService.getOffers({
        page,
        limit: 10,
        offerType: typeFilter,
        isActive: activeFilter === "" ? "" : activeFilter === "true",
      });
      setOffers(response.data.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch offers");
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchOffers: () => fetchOffers(currentPage),
  }));

  useEffect(() => {
    fetchOffers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, typeFilter, activeFilter]);

  const handleToggle = async (offer: Offer) => {
    try {
      const response = await offersService.toggleOffer(offer._id);
      const updated = response.data.offer;
      setOffers((prev) =>
        prev.map((o) =>
          o._id === offer._id
            ? { ...o, isActive: updated.isActive, status: updated.status }
            : o
        )
      );
      toast.success("Offer toggled successfully");
    } catch (error) {
      toast.error("Failed to toggle offer");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await offersService.deleteOffer(pendingDelete._id);
      toast.success("Offer deleted successfully");
      setOffers((prev) => prev.filter((o) => o._id !== pendingDelete._id));
      setPendingDelete(null);
    } catch (error) {
      toast.error("Failed to delete offer");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as OfferType | "");
            setCurrentPage(1);
          }}
          className={`${adminInputClass} cursor-pointer sm:w-52`}
          aria-label="Filter by type"
        >
          <option value="">All Types</option>
          {OFFER_TYPES.map((type) => (
            <option key={type} value={type}>
              {OFFER_TYPE_LABELS[type]}
            </option>
          ))}
        </select>

        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value as "" | "true" | "false");
            setCurrentPage(1);
          }}
          className={`${adminInputClass} cursor-pointer sm:w-52`}
          aria-label="Filter by status"
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : !offers || offers.length === 0 ? (
        <EmptyState
          icon={TagIcon}
          title="No offers found"
          description="There are no offers matching the current filters."
        />
      ) : (
        <>
          <TableShell>
            <Thead>
              <tr>
                <Th>Title</Th>
                <Th>Offer Type</Th>
                <Th>Status</Th>
                <Th>Active</Th>
                <Th>Created At</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {offers.map((offer) => (
                <Tr key={offer._id}>
                  <Td className="font-medium text-admin-ink">{offer.title}</Td>
                  <Td>
                    <Badge tone="default">
                      {OFFER_TYPE_LABELS[offer.offerType] || offer.offerType}
                    </Badge>
                  </Td>
                  <Td>
                    <StatusBadge status={offer.status} />
                  </Td>
                  <Td>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={offer.isActive}
                      aria-label={`Toggle ${offer.title}`}
                      onClick={() => handleToggle(offer)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        offer.isActive
                          ? "bg-admin-brown"
                          : "bg-admin-surface-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-admin-surface transition-transform ${
                          offer.isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </Td>
                  <Td className="tabular text-admin-ink-muted">
                    {offer.createdAt
                      ? format(new Date(offer.createdAt), "MMM d, yyyy")
                      : "-"}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton
                        label={`Edit ${offer.title}`}
                        icon={<PencilIcon />}
                        onClick={() => onEdit(offer)}
                      />
                      <IconButton
                        label={`Delete ${offer.title}`}
                        icon={<TrashIcon />}
                        variant="danger"
                        onClick={() => setPendingDelete(offer)}
                      />
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </TableShell>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete offer"
        description={
          pendingDelete ? `“${pendingDelete.title}” will be permanently removed.` : ""
        }
        confirmLabel="Delete"
        danger
        loading={isDeleting}
      />
    </div>
  );
});

OfferList.displayName = "OfferList";
export default OfferList;
