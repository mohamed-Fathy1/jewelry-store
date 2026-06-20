export type OfferType =
  | "buy_x_get_cheapest_free"
  | "spend_x_get_discount"
  | "spend_x_get_free_shipping"
  | "buy_x_get_free_shipping"
  | "buy_x_get_half_price"
  | "spend_x_get_free_item"
  | "flash_sale";

export type OfferStatus = "scheduled" | "active" | "expired";

export interface OfferImage {
  mediaUrl: string;
  mediaKey?: string;
}

export interface OfferTiming {
  startDate: string | null;
  endDate: string | null;
}

export interface OfferCondition {
  minQuantity?: number | null;
  minAmount?: number | null;
  excludedCategories?: any[];
}

export interface OfferReward {
  discountPercentage?: number | null;
  freeItemMaxValue?: number | null;
}

export interface Offer {
  _id: string;
  title: string;
  description?: string;
  isActive: boolean;
  status: OfferStatus;
  image: OfferImage;
  offerType: OfferType;
  timing?: OfferTiming;
  condition?: OfferCondition;
  reward?: OfferReward;
  targetProducts?: any[];
  targetCategories?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferDto {
  title: string;
  description?: string;
  isActive?: boolean;
  image: { mediaUrl: string };
  offerType: OfferType;
  timing?: OfferTiming;
  condition?: OfferCondition;
  reward?: OfferReward;
  targetProducts?: string[];
  targetCategories?: string[];
}

export type UpdateOfferDto = Partial<CreateOfferDto>;

export interface OfferResponse {
  statusCode: number;
  data: {
    offer: Offer;
  };
  message: string;
}

export interface OffersResponse {
  statusCode: number;
  data: {
    data: Offer[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
  message?: string;
}

export interface OffersQuery {
  page?: number;
  limit?: number;
  offerType?: OfferType | "";
  isActive?: boolean | "";
  search?: string;
}
