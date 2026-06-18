import api from "@/lib/axios";
import {
  AdminOrdersQuery,
  AdminOrdersListResponse,
  AdminOrderResponse,
  OrderStatus,
} from "@/types/admin-order.types";

// Typed client for the Admin Orders API (/admin/orders). One function per
// endpoint, matching ADMIN_ORDERS_API.md exactly. The Bearer token is attached
// by the axios request interceptor; 401s redirect to /admin/login there.
export const adminOrdersService = {
  // GET /admin/orders/all?page=<n>&status=<optional>&orderId=<optional>
  async getOrders(
    query: AdminOrdersQuery
  ): Promise<AdminOrdersListResponse> {
    try {
      const params = new URLSearchParams();
      // page is required; the server clamps invalid values to 1.
      params.append("page", String(query.page ?? 1));
      if (query.status) params.append("status", query.status);
      // Suffix match on _id (e.g. last 8 chars). Strip a leading '#' if present.
      if (query.orderId) {
        params.append("orderId", query.orderId.replace(/^#/, "").trim());
      }

      const response = await api.get(
        `/admin/orders/all?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  // GET /admin/orders/:orderId
  async getOrder(orderId: string): Promise<AdminOrderResponse> {
    try {
      const response = await api.get(`/admin/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

  // PATCH /admin/orders/status/:orderId  body: { status }
  // status="cancelled" / "deleted" restore stock server-side; "cancelled" also
  // emails admins. The client does not need to do anything special for those.
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<AdminOrderResponse> {
    try {
      const response = await api.patch(`/admin/orders/status/${orderId}`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },
};
