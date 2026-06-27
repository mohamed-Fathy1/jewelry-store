import { Category } from "./category.types";

export interface Media {
  mediaUrl: string;
  mediaId: string;
  _id?: string;
}

export interface VariantColor {
  _id: string;
  name: string;
  hex: string;
}

export interface VariantSize {
  _id: string;
  number: string;
  order: number;
}

export interface ProductVariant {
  _id: string;
  product: string;
  color: VariantColor | string;
  size: VariantSize | string;
  availableItems: number;
}

export interface AdminProduct {
  _id: string;
  productName: string;
  productDescription: string;
  price: number;
  availableItems: number;
  salePrice?: number;
  discount?: number;
  discountPercentage?: number;
  soldItems?: number;
  isSoldOut?: boolean;
  isSale?: boolean;
  isBestSeller?: boolean;
  bestSellerManual?: boolean;
  wholesalePrice?: number;
  finalPrice: number;
  category?: Category | null;
  slug?: string;
  defaultImage: Media;
  albumImages?: Media[];
  createdAt?: number | string;
  isDeleted?: boolean;
  variants?: ProductVariant[];
}

export interface VariantInput {
  _id?: string;
  /** Optional: a simple product is one variant with neither color nor size. */
  color?: string | null;
  size?: string | null;
  availableItems: number;
}

export interface CreateProductDto {
  productName: string;
  productDescription: string;
  price: number;
  categoryId: string;
  defaultImage: string;
  salePrice?: number;
  albumImages?: string[];
  wholesalePrice?: number;
  isBestSeller?: boolean;
  /** Stock is owned by the variants; every product has at least one. */
  variants: VariantInput[];
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminProductsResponse {
  statusCode: number;
  data: {
    products: AdminProduct[];
    pagination: Pagination;
  };
  message: string;
  success: boolean;
}

export interface AdminProductResponse {
  statusCode: number;
  data: {
    product: AdminProduct;
  };
  message: string;
  success: boolean;
}

export interface AdminProductsQuery {
  search?: string;
  category?: string;
  isBestSeller?: "" | "true" | "false";
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  isDeleted?: "" | "true" | "false";
  sort?: "" | "price" | "createdAt" | "soldItems";
  page?: number;
  limit?: number;
}

export interface TopSellingProduct {
  productName: string;
  soldItems: number;
  discountPercentage?: number;
  defaultImage?: { mediaUrl: string };
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
}

export interface ProductAnalysis {
  products: {
    total: number;
    soldOut: number;
    topSelling?: TopSellingProduct[];
    totalFinalPrice?: number;
    totalWholesalePrice?: number;
  };
  categories: {
    total: number;
  };
  orders: {
    total: number;
    todaySales: number;
    todayOrders?: number;
    totalRevenue: number;
    averageOrderValue?: number;
    byStatus?: Record<string, number>;
    last7Days?: DailySales[];
  };
  customers: {
    total: number;
  };
}

export interface ProductAnalysisResponse {
  statusCode: number;
  data: {
    analysis: ProductAnalysis;
  };
  message: string;
  success: boolean;
}
