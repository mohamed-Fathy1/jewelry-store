export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: Order[];
  topProducts: Product[];
  salesByDay: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: {
    stats: DashboardStats;
  };
}

export interface AdminOrder extends Order {
  customer: {
    name: string;
    email: string;
  };
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
