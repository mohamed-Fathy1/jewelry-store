"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import OrderList from "@/components/admin/orders/OrderList";
import OrderDetails from "@/components/admin/orders/OrderDetails";
import { IconButton } from "@/components/admin/ui";

export default function OrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  return (
    <div>
      {/* Header + list (the header lives inside OrderList per the design spec) */}
      <OrderList onViewDetails={setSelectedOrderId} />

      {/* Order Detail (opened when clicking an order row) */}
      <Dialog
        open={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        className="admin-theme fixed inset-0 z-40 overflow-y-auto"
      >
        <div className="flex min-h-screen items-start justify-center p-4">
          <Dialog.Overlay
            className="fixed inset-0"
            style={{ backgroundColor: "var(--admin-overlay)" }}
          />

          <div className="relative mx-auto my-8 w-full max-w-5xl rounded-xl bg-admin-surface p-6 shadow-admin-popover ring-1 ring-admin-hairline">
            <div className="mb-6 flex items-center justify-between">
              <Dialog.Title className="text-3xl font-normal italic text-admin-heading">
                Order Detail
              </Dialog.Title>
              <IconButton
                label="Close"
                icon={<XMarkIcon />}
                onClick={() => setSelectedOrderId(null)}
              />
            </div>

            {selectedOrderId && <OrderDetails orderId={selectedOrderId} />}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
