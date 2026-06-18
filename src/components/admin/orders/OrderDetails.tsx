"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  CubeIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { formatEGP } from "@/utils/format";
import { useAdminOrder, useUpdateOrderStatus } from "@/hooks/useAdminOrders";
import { getApiErrorMessage } from "@/utils/apiError";
import { OrderStatus } from "@/types/admin-order.types";
import OrderStatusBadge from "./OrderStatusBadge";
import {
  ORDER_FLOW,
  flowIndex,
  nextFlowStatus,
  isTerminalStatus,
  formatOrderStatus,
  shortOrderId,
  orderSubtotal,
  orderTotal,
} from "./orderStatus";

export default function OrderDetails({ orderId }: { orderId: string }) {
  const { data, isLoading, isError, error } = useAdminOrder(orderId);
  const updateStatus = useUpdateOrderStatus();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (isLoading) {
    return (
      <div
        className="py-10 text-center"
        style={{ color: "var(--color-text-muted)" }}
      >
        Loading order…
      </div>
    );
  }

  if (isError || !data?.data?.order) {
    return (
      <div className="py-10 text-center" style={{ color: "var(--color-danger)" }}>
        {getApiErrorMessage(error, "Order not found.")}
      </div>
    );
  }

  const order = data.data.order;
  const info = order.userInformation;
  const terminal = isTerminalStatus(order.status);
  const next = nextFlowStatus(order.status);
  const currentIndex = flowIndex(order.status);

  // subTotal/totalAmount can come back as 0; fall back to the line items.
  const subTotal = orderSubtotal(order);
  const totalAmount = orderTotal(order);

  const advance = () => {
    if (next) updateStatus.mutate({ orderId: order._id, status: next });
  };
  const confirmCancel = () => {
    updateStatus.mutate(
      { orderId: order._id, status: "cancelled" },
      { onSettled: () => setShowCancelConfirm(false) }
    );
  };

  return (
    <div className="space-y-8">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              Total
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "var(--color-primary)",
            }}
          >
            {formatEGP(totalAmount)}
          </div>
          <p
            className="mt-0.5"
            style={{ fontSize: 13, color: "var(--color-text-muted)" }}
          >
            #{shortOrderId(order._id)} ·{" "}
            {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Primary: advance to next step */}
          {!terminal && next && (
            <button
              onClick={advance}
              disabled={updateStatus.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ borderRadius: 999, background: "var(--color-primary)" }}
            >
              <CheckIcon className="h-4 w-4" />
              Mark as {formatOrderStatus(next)}
            </button>
          )}

          {/* Cancel (destructive) */}
          {!terminal && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={updateStatus.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ borderRadius: 999, background: "var(--color-danger)" }}
            >
              Cancel order
            </button>
          )}
        </div>
      </div>

      {/* Progress tracker OR terminal banner */}
      {terminal ? (
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{
            border: "1px solid var(--color-border)",
            background: "var(--color-primary-light)",
          }}
        >
          <ExclamationTriangleIcon
            className="h-5 w-5 flex-shrink-0 mt-0.5"
            style={{ color: "var(--color-danger)" }}
          />
          <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>
            This order is <strong>{formatOrderStatus(order.status)}</strong>.
            Product stock has been restored on the server.
          </p>
        </div>
      ) : (
        <Stepper currentIndex={currentIndex} />
      )}

      {/* Body: details + summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer + shipping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Panel title="Customer">
              {info ? (
                <div
                  className="text-sm space-y-1"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  <p>
                    {info.firstName} {info.lastName}
                  </p>
                  <p style={{ color: "var(--color-text-muted)" }}>
                    {info.primaryPhone}
                  </p>
                  {info.secondaryPhone && (
                    <p style={{ color: "var(--color-text-muted)" }}>
                      {info.secondaryPhone}
                    </p>
                  )}
                  <p style={{ color: "var(--color-text-muted)" }}>
                    {info.address}
                  </p>
                  <p style={{ color: "var(--color-text-muted)" }}>
                    {[info.country, info.postalCode].filter(Boolean).join(" · ")}
                  </p>
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  No customer information
                </p>
              )}
            </Panel>

            <Panel title="Shipping">
              <SummaryRow
                label="Method"
                value={order.shipping?.name ?? "—"}
              />
              <SummaryRow
                label="Cost"
                value={
                  order.freeShipping ? "Free" : formatEGP(order.shippingCost)
                }
              />
            </Panel>
          </div>

          {/* Products */}
          <Panel title="Products">
            <div className="space-y-3">
              {order.products?.map((line, index) => (
                <div
                  key={line.productId?._id ?? index}
                  className="flex items-center gap-4 p-3 rounded-xl"
                  style={{ border: "1px solid var(--color-border)" }}
                >
                  <div className="h-16 w-16 relative flex-shrink-0">
                    {line.productId?.defaultImage?.mediaUrl ? (
                      <Image
                        src={line.productId.defaultImage.mediaUrl}
                        alt={line.productName}
                        fill
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div
                        className="h-16 w-16 rounded-md flex items-center justify-center"
                        style={{ background: "var(--color-bg-page)" }}
                      >
                        <CubeIcon className="h-7 w-7 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className="font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {line.productId?.productName || line.productName}
                      </p>
                      {line.isFreeGift && (
                        <span
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{
                            background: "var(--color-primary-light)",
                            color: "var(--color-primary-text)",
                          }}
                        >
                          Free gift
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {[
                        line.size && `Size: ${line.size}`,
                        line.color && `Color: ${line.color}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span
                        className="text-sm"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {line.quantity} × {formatEGP(line.itemPrice)}
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {formatEGP(line.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Summary side card */}
        <div className="lg:col-span-1">
          <div
            className="p-6 rounded-xl sticky top-0"
            style={{
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="mb-4"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              Summary
            </div>
            <SummaryRow label="Subtotal" value={formatEGP(subTotal)} />
            {order.discount > 0 && (
              <SummaryRow
                label="Discount"
                value={`- ${formatEGP(order.discount)}`}
              />
            )}
            <SummaryRow
              label="Shipping"
              value={
                order.freeShipping ? "Free" : formatEGP(order.shippingCost)
              }
            />
            <div
              className="my-3"
              style={{ borderTop: "1px solid var(--color-border)" }}
            />
            <div className="flex justify-between items-center">
              <span
                className="font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                TOTAL
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--color-primary)",
                }}
              >
                {formatEGP(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel confirmation */}
      <Dialog
        open={showCancelConfirm}
        onClose={() => !updateStatus.isPending && setShowCancelConfirm(false)}
        className="fixed inset-0 z-[60] overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div
            className="relative w-full max-w-md mx-auto p-6 rounded-xl"
            style={{ background: "var(--color-bg-surface)" }}
          >
            <div className="flex items-start gap-3 mb-4">
              <ExclamationTriangleIcon
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: "var(--color-danger)" }}
              />
              <Dialog.Title
                className="text-xl font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Cancel this order?
              </Dialog.Title>
            </div>
            <div
              className="mb-5 p-3 rounded-md space-y-2"
              style={{
                background: "var(--color-primary-light)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                Cancelling <strong>restores product stock</strong> on the server
                and sends an email notification to the admin addresses.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={updateStatus.isPending}
                className="px-4 py-2 text-sm font-medium disabled:opacity-50"
                style={{
                  borderRadius: 999,
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
              >
                Keep order
              </button>
              <button
                onClick={confirmCancel}
                disabled={updateStatus.isPending}
                className="px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                style={{ borderRadius: 999, background: "var(--color-danger)" }}
              >
                {updateStatus.isPending ? "Cancelling…" : "Cancel order"}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Horizontal stepper
// ---------------------------------------------------------------------------
function Stepper({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="flex items-center">
      {ORDER_FLOW.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        const active = done || current;
        const Icon = step.icon;
        return (
          <div key={step.status} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 44,
                  height: 44,
                  background: active ? "var(--color-primary)" : "transparent",
                  border: active
                    ? "none"
                    : "1px solid var(--color-border)",
                  color: active ? "#fff" : "var(--color-text-muted)",
                }}
              >
                {done ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className="mt-2 text-xs text-center"
                style={{
                  fontWeight: current ? 700 : 400,
                  color: active
                    ? "var(--color-text-primary)"
                    : "var(--color-text-muted)",
                }}
              >
                {step.label}
              </span>
            </div>
            {i < ORDER_FLOW.length - 1 && (
              <div
                className="flex-1 mx-2"
                style={{
                  height: 2,
                  marginBottom: 20,
                  background:
                    i < currentIndex
                      ? "var(--color-primary)"
                      : "var(--color-border)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="mb-3"
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </span>
    </div>
  );
}
