// Types for the Admin Wishlists view.
// Source of truth: GET /wishlist/get-all-wishlist?page=<n>
// Lists every product saved to ANY customer's wishlist, with the auth account
// and (optional) customer profile attached. Page size is fixed at 20
// server-side; pass `page` (defaults to 1).
//
// Kept separate from the customer-facing `wishlist.types.ts` (WishlistItem /
// WishlistResponse) so the shopper flow is unaffected — mirrors how
// `admin-order.types.ts` is split from `order.types.ts`.

// ---------------------------------------------------------------------------
// Shared media shape (matches defaultImage / albumImages items).
// ---------------------------------------------------------------------------
export interface WishlistMedia {
  mediaUrl: string;
  mediaId: string;
}

// ---------------------------------------------------------------------------
// The auth account (minimal, safe fields).
// ---------------------------------------------------------------------------
export interface WishlistUser {
  _id: string;
  email: string;
  role: "user" | "admin";
  status: string;
  isConfirmed: boolean;
}

// ---------------------------------------------------------------------------
// The customer profile — null when none has been saved.
// ---------------------------------------------------------------------------
export interface WishlistShipping {
  _id: string;
  category: string; // city / shipping zone label
  cost: number;
}

export interface WishlistUserInformation {
  _id: string;
  fullName?: string;
  // Kept optional for any not-yet-migrated legacy profile rendering.
  firstName?: string;
  lastName?: string;
  primaryPhone: string;
  secondaryPhone?: string;
  country?: string;
  address: string;
  isDefault?: boolean;
  shipping: WishlistShipping | null;
  createdAt: string; // ISO date
}

// ---------------------------------------------------------------------------
// The saved product (populated).
// ---------------------------------------------------------------------------
export interface WishlistProductCategory {
  _id: string;
  categoryName: string;
  image: object;
  slug: string;
}

export interface WishlistProduct {
  _id: string;
  productName: string;
  price: number;
  salePrice: number;
  discount: number;
  discountPercentage: number;
  isSale: boolean;
  soldItems: number;
  availableItems: number;
  defaultImage: WishlistMedia;
  albumImages: WishlistMedia[];
  category: WishlistProductCategory;
}

// ---------------------------------------------------------------------------
// One row: a single product saved by a single customer.
// ---------------------------------------------------------------------------
export interface WishlistEntry {
  _id: string;
  createdAt: number; // epoch ms — when it was added to the wishlist
  user: WishlistUser;
  userInformation: WishlistUserInformation | null;
  productId: WishlistProduct;
}

// ---------------------------------------------------------------------------
// Response envelope ({ statusCode, data, message, success }).
// data.wishlist = { totalItems, totalPages, currentPage, products[] }
// ---------------------------------------------------------------------------
export interface AdminWishlistPage {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  products: WishlistEntry[];
}

export interface AdminWishlistResponse {
  statusCode: number;
  data: { wishlist: AdminWishlistPage };
  message: string;
  success: boolean;
}
