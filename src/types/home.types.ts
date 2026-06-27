import { Product } from "@/types/product.types";

export interface FlashSale {
  _id?: string;
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
  newArrivals: Product[];
  /** /home now returns every live flash sale (soonest-ending first). */
  flashSale: FlashSale[];
}

export interface HomeResponse {
  statusCode: number;
  data: HomeData;
  message: string;
  success: boolean;
}
