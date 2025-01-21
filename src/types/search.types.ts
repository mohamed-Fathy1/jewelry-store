import { Product } from "./product.types";

export interface SearchResponse {
  statusCode: number;
  data: {
    products: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      data: Product[];
    };
  };
  message: string;
  success: boolean;
}
