import { User } from "./user.types";
import { Product } from "./product.types";

export interface WishlistItem {
  _id: string;
  user: User;
  productId: Product;
  createdAt: number;
}

export interface WishlistResponse {
  statusCode: number;
  data: {
    wishlist: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      products: WishlistItem[];
    };
  };
  message: string;
  success: boolean;
}
