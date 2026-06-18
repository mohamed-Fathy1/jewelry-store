import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminOrdersService } from "@/services/admin-orders.service";
import {
  AdminOrdersQuery,
  AdminOrderResponse,
  UpdateOrderStatusInput,
} from "@/types/admin-order.types";
import { getApiErrorMessage } from "@/utils/apiError";

// Centralized query keys so cache invalidation stays consistent.
export const adminOrderKeys = {
  all: ["admin", "orders"] as const,
  list: (filters: AdminOrdersQuery) =>
    [...adminOrderKeys.all, "list", filters] as const,
  detail: (orderId: string) =>
    [...adminOrderKeys.all, "detail", orderId] as const,
};

// Paginated list with optional status filter and orderId suffix search.
// keepPreviousData avoids a flicker while paging/filtering.
export function useAdminOrders(filters: AdminOrdersQuery) {
  return useQuery({
    queryKey: adminOrderKeys.list(filters),
    queryFn: () => adminOrdersService.getOrders(filters),
    placeholderData: keepPreviousData,
  });
}

// Single order. Disabled until an orderId is provided.
export function useAdminOrder(orderId: string | null | undefined) {
  return useQuery({
    queryKey: adminOrderKeys.detail(orderId ?? ""),
    queryFn: () => adminOrdersService.getOrder(orderId as string),
    enabled: Boolean(orderId),
  });
}

// Status update / cancel / soft-delete. On success, refreshes the affected
// order's detail cache and all list queries, and surfaces a toast.
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation<AdminOrderResponse, unknown, UpdateOrderStatusInput>({
    mutationFn: ({ orderId, status }) =>
      adminOrdersService.updateOrderStatus(orderId, status),
    onSuccess: (data, variables) => {
      // Seed the detail cache with the updated order, then invalidate lists.
      queryClient.setQueryData(
        adminOrderKeys.detail(variables.orderId),
        data
      );
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
      toast.success("Order updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update order status"));
    },
  });
}
