import { User } from "./user.types";
import { Product } from "./product.types";

export interface WishlistItem {
  _id: string;
  user: User;
  productId: Product;
  createdAt: number;
}

export interface WishlistPage {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  products: WishlistItem[];
}

export interface WishlistResponse {
  statusCode: number;
  data: {
    // /wishlist/get-user-wishlist returns a flat array; the paginated admin
    // /wishlist/get-all-wishlist returns the object form.
    wishlist: WishlistItem[] | WishlistPage;
  };
  message: string;
  success: boolean;
}
