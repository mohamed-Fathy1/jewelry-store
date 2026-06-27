"use client";

import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, TruckIcon } from "@heroicons/react/24/outline";
import { Shipping } from "@/types/shipping.types";
import { adminService } from "@/services/admin.service";
import toast from "react-hot-toast";
import { formatPrice } from "@/utils/format";
import {
  TableShell,
  Thead,
  Tbody,
  Th,
  Td,
  Tr,
  IconButton,
  SkeletonTable,
  EmptyState,
  ConfirmDialog,
} from "@/components/admin/ui";

interface ShippingListProps {
  onEdit: (shipping: Shipping) => void;
}

export default function ShippingList({ onEdit }: ShippingListProps) {
  const [shippings, setShippings] = useState<Shipping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<Shipping | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchShippings = async () => {
    try {
      const response = await adminService.getShippings();
      setShippings(response.data.shipping);
    } catch (error) {
      toast.error("Failed to fetch shipping options");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShippings();
  }, []);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await adminService.deleteShipping(pendingDelete._id);
      toast.success("Shipping option deleted successfully");
      fetchShippings();
      setPendingDelete(null);
    } catch (error) {
      toast.error("Failed to delete shipping option");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <SkeletonTable rows={6} cols={3} />;

  if (!shippings || shippings.length === 0) {
    return (
      <EmptyState
        icon={TruckIcon}
        title="No shipping regions"
        description="Add a region to define delivery costs."
      />
    );
  }

  return (
    <div>
      <TableShell>
        <Thead>
          <tr>
            <Th>Region</Th>
            <Th>Cost</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </Thead>
        <Tbody>
          {shippings.map((shipping) => (
            <Tr key={shipping._id}>
              <Td className="font-medium text-admin-ink">{shipping.category}</Td>
              <Td className="tabular font-medium text-admin-ink">
                {formatPrice(shipping.cost)}
              </Td>
              <Td className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <IconButton
                    label={`Edit ${shipping.category}`}
                    icon={<PencilIcon />}
                    onClick={() => onEdit(shipping)}
                  />
                  <IconButton
                    label={`Delete ${shipping.category}`}
                    icon={<TrashIcon />}
                    variant="danger"
                    onClick={() => setPendingDelete(shipping)}
                  />
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </TableShell>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete shipping option"
        description={
          pendingDelete
            ? `“${pendingDelete.category}” will be permanently removed.`
            : ""
        }
        confirmLabel="Delete"
        danger
        loading={isDeleting}
      />
    </div>
  );
}
