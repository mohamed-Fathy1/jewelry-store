"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { PencilIcon, TrashIcon, TagIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { Offer, OfferType } from "@/types/offer.types";
import { offersService } from "@/services/offers.service";
import { useDebounce } from "@/hooks/useDebounce";
import { OFFER_TYPE_LABELS, OFFER_TYPES } from "./offerMeta";
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
  Select,
  Toggle,
  SearchInput,
  type SelectOption,
} from "@/components/admin/ui";
import toast from "react-hot-toast";

interface OfferListProps {
  onEdit: (offer: Offer) => void;
}

export interface OfferListRef {
  fetchOffers: () => Promise<void>;
}

const TYPE_FILTER_OPTIONS: SelectOption[] = [
  { value: "", label: "All Types" },
  ...OFFER_TYPES.map((t) => ({ value: t, label: OFFER_TYPE_LABELS[t] })),
];

const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: "", label: "All Statuses" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

const OfferList = forwardRef<OfferListRef, OfferListProps>(({ onEdit }, ref) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState<OfferType | "">("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Offer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOffers = async (
    page: number = currentPage,
    searchQuery: string = search
  ) => {
    setIsLoading(true);
    try {
      const response = await offersService.getOffers({
        page,
        limit: 10,
        offerType: typeFilter,
        isActive: activeFilter === "" ? "" : activeFilter === "true",
        search: searchQuery.trim() || undefined,
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
    fetchOffers(currentPage, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, typeFilter, activeFilter]);

  const debouncedSearch = useDebounce((value: string) => {
    setCurrentPage(1);
    fetchOffers(1, value);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search offers by title…"
          ariaLabel="Search offers"
          className="sm:flex-1"
        />
        <div className="sm:w-52">
          <Select
            ariaLabel="Filter by type"
            value={typeFilter}
            onChange={(v) => {
              setTypeFilter(v as OfferType | "");
              setCurrentPage(1);
            }}
            options={TYPE_FILTER_OPTIONS}
          />
        </div>
        <div className="sm:w-44">
          <Select
            ariaLabel="Filter by status"
            value={activeFilter}
            onChange={(v) => {
              setActiveFilter(v as "" | "true" | "false");
              setCurrentPage(1);
            }}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>
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
                    <Toggle
                      label={`Toggle ${offer.title}`}
                      checked={offer.isActive}
                      onChange={() => handleToggle(offer)}
                    />
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
