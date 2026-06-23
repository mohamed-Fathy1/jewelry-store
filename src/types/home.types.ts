import { Product } from "@/types/product.types";

export interface FlashSale {
  title: string;
  description: string;
  discountPercentage: number;
  /** ISO date string the flash sale ends at. */
  endDate: string;
  products: Product[];
}

export interface HomeData {
  bestSellers: Product[];
  onSale: Product[];
  flashSale: FlashSale | null;
}

export interface HomeResponse {
  statusCode: number;
  data: HomeData;
  message: string;
  success: boolean;
}
