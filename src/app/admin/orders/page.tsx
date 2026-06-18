"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import OrderList from "@/components/admin/orders/OrderList";
import OrderDetails from "@/components/admin/orders/OrderDetails";

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
        className="fixed inset-0 z-40 overflow-y-auto"
      >
        <div className="flex items-start justify-center min-h-screen p-4">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div
            className="relative w-full max-w-5xl mx-auto p-6 my-8 rounded-xl"
            style={{ background: "var(--color-bg-page)" }}
          >
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title
                className="italic"
                style={{
                  fontSize: 32,
                  fontWeight: 400,
                  color: "var(--color-text-primary)",
                }}
              >
                Order Detail
              </Dialog.Title>
              <button
                onClick={() => setSelectedOrderId(null)}
                style={{ color: "var(--color-text-muted)" }}
                className="hover:opacity-70"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {selectedOrderId && <OrderDetails orderId={selectedOrderId} />}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
