"use client";

import { useState } from "react";
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
import { customerName } from "@/utils/customerName";
import { Button, StatusBadge, Thumbnail } from "@/components/admin/ui";
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
      <div className="py-10 text-center text-admin-ink-muted">
        Loading order…
      </div>
    );
  }

  if (isError || !data?.data?.order) {
    return (
      <div className="py-10 text-center text-admin-danger">
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
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-admin-ink-muted">
              Total
            </span>
            <StatusBadge
              status={order.status}
              label={formatOrderStatus(order.status)}
            />
          </div>
          <div className="text-2xl font-semibold text-admin-heading tabular">
            {formatEGP(totalAmount)}
          </div>
          <p className="mt-0.5 text-[13px] text-admin-ink-muted tabular">
            #{shortOrderId(order._id)} ·{" "}
            {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Primary: advance to next step */}
          {!terminal && next && (
            <Button
              variant="primary"
              onClick={advance}
              loading={updateStatus.isPending}
              leftIcon={<CheckIcon className="h-4 w-4" />}
            >
              Mark as {formatOrderStatus(next)}
            </Button>
          )}

          {/* Cancel (destructive) */}
          {!terminal && (
            <Button
              variant="danger"
              onClick={() => setShowCancelConfirm(true)}
              disabled={updateStatus.isPending}
            >
              Cancel order
            </Button>
          )}
        </div>
      </div>

      {/* Progress tracker OR terminal banner */}
      {terminal ? (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-admin-hairline bg-admin-surface-muted">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5 text-admin-danger" />
          <p className="text-sm text-admin-ink">
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
                <div className="text-sm space-y-1 text-admin-ink">
                  <p>
                    {customerName(info)}
                  </p>
                  <p className="text-admin-ink-muted tabular">
                    {info.primaryPhone}
                  </p>
                  {info.secondaryPhone && (
                    <p className="text-admin-ink-muted tabular">
                      {info.secondaryPhone}
                    </p>
                  )}
                  <p className="text-admin-ink-muted">{info.address}</p>
                  <p className="text-admin-ink-muted">
                    {[info.country, info.postalCode].filter(Boolean).join(" · ")}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-admin-ink-muted">
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
                  className="flex items-center gap-4 p-3 rounded-xl border border-admin-hairline"
                >
                  <Thumbnail
                    src={line.productId?.defaultImage?.mediaUrl}
                    alt={line.productName}
                    className="h-16 w-16"
                    icon={CubeIcon}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-admin-ink">
                        {line.productId?.productName || line.productName}
                      </p>
                      {line.isFreeGift && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-admin-gold-soft text-admin-heading">
                          Free gift
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5 text-admin-ink-muted">
                      {[
                        line.size && `Size: ${line.size}`,
                        line.color && `Color: ${line.color}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-admin-ink-muted tabular">
                        {line.quantity} × {formatEGP(line.itemPrice)}
                      </span>
                      <span className="font-medium text-admin-ink tabular">
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
          <div className="p-6 rounded-xl sticky top-0 bg-admin-surface ring-1 ring-admin-hairline shadow-admin-card">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-admin-ink-muted">
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
            <div className="my-3 border-t border-admin-hairline" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-admin-ink">TOTAL</span>
              <span className="text-xl font-bold text-admin-heading tabular">
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
        className="admin-theme fixed inset-0 z-[60] overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Overlay
            className="fixed inset-0"
            style={{ backgroundColor: "var(--admin-overlay)" }}
          />
          <div className="relative w-full max-w-md mx-auto p-6 rounded-xl bg-admin-surface ring-1 ring-admin-hairline shadow-admin-popover">
            <div className="flex items-start gap-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0 mt-0.5 text-admin-danger" />
              <Dialog.Title className="text-xl font-semibold text-admin-heading">
                Cancel this order?
              </Dialog.Title>
            </div>
            <div className="mb-5 p-3 rounded-md space-y-2 bg-admin-surface-muted border border-admin-hairline">
              <p className="text-sm text-admin-ink">
                Cancelling <strong>restores product stock</strong> on the server
                and sends an email notification to the admin addresses.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowCancelConfirm(false)}
                disabled={updateStatus.isPending}
              >
                Keep order
              </Button>
              <Button
                variant="danger"
                onClick={confirmCancel}
                loading={updateStatus.isPending}
              >
                {updateStatus.isPending ? "Cancelling…" : "Cancel order"}
              </Button>
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
                className={`flex items-center justify-center rounded-full h-11 w-11 ${
                  active
                    ? "bg-admin-brown text-admin-on-accent"
                    : "border border-admin-hairline text-admin-ink-subtle"
                }`}
              >
                {done ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`mt-2 text-xs text-center ${
                  current ? "font-bold" : "font-normal"
                } ${active ? "text-admin-ink" : "text-admin-ink-subtle"}`}
              >
                {step.label}
              </span>
            </div>
            {i < ORDER_FLOW.length - 1 && (
              <div
                className={`flex-1 mx-2 h-0.5 mb-5 ${
                  i < currentIndex ? "bg-admin-brown" : "bg-admin-hairline"
                }`}
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
    <div className="p-4 rounded-xl bg-admin-surface border border-admin-hairline">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-admin-ink-muted">
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
      <span className="text-admin-ink-muted">{label}</span>
      <span className="font-medium text-admin-ink tabular">{value}</span>
    </div>
  );
}
