"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { colors } from "@/constants/colors";
import { Offer, OfferStatus, OfferType } from "@/types/offer.types";
import { offersService } from "@/services/offers.service";
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

const getStatusColor = (status: OfferStatus) => {
  const statusColors: Record<OfferStatus, string> = {
    scheduled: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    expired: "bg-gray-100 text-gray-800",
  };
  return statusColors[status] || "bg-gray-100 text-gray-800";
};

const formatStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const OfferList = forwardRef<OfferListRef, OfferListProps>(({ onEdit }, ref) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState<OfferType | "">("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");

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

  const handleDelete = async (offerId: string) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        await offersService.deleteOffer(offerId);
        toast.success("Offer deleted successfully");
        setOffers((prev) => prev.filter((o) => o._id !== offerId));
      } catch (error) {
        toast.error("Failed to delete offer");
      }
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as OfferType | "");
            setCurrentPage(1);
          }}
          className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brown"
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
          className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brown"
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : !offers || offers.length === 0 ? (
        <div
          className="text-center py-12 px-4 border-2 border-dashed rounded-lg"
          style={{ borderColor: colors.border }}
        >
          <TagIcon
            className="mx-auto h-16 w-16 mb-4"
            style={{ color: colors.textSecondary }}
          />
          <h3
            className="text-lg font-medium mb-2"
            style={{ color: colors.textPrimary }}
          >
            No Offers Found
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            There are no offers matching the current filters.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto min-h-[40vh]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Offer Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Active
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created At
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {offers.map((offer) => (
                  <tr key={offer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {offer.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {OFFER_TYPE_LABELS[offer.offerType] || offer.offerType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          offer.status
                        )}`}
                      >
                        {formatStatus(offer.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={offer.isActive}
                        onClick={() => handleToggle(offer)}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                        style={{
                          backgroundColor: offer.isActive
                            ? colors.brown
                            : "#D1D5DB",
                        }}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            offer.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {offer.createdAt
                          ? format(new Date(offer.createdAt), "MMM d, yyyy")
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onEdit(offer)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(offer._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center my-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 rounded-md text-sm"
              style={{
                backgroundColor: currentPage === 1 ? "#eee" : colors.brown,
                color: currentPage === 1 ? "#666" : "white",
              }}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 rounded-md text-sm"
              style={{
                backgroundColor:
                  currentPage === totalPages ? "#eee" : colors.brown,
                color: currentPage === totalPages ? "#666" : "white",
              }}
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </>
      )}
    </div>
  );
});

OfferList.displayName = "OfferList";
export default OfferList;
