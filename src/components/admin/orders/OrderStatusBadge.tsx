import { OrderStatus } from "@/types/admin-order.types";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABELS } from "./orderStatus";

export default function OrderStatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const meta = ORDER_STATUS_BADGE[status];
  return (
    <span
      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
        meta?.className ?? "bg-gray-100 text-gray-800"
      }`}
      style={meta?.style}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}
