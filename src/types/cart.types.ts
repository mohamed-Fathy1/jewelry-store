import type { Dispatch, SetStateAction } from "react";

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  productImage: string;
  availableItems: number;
  /** Selected variant details (present only for products that have variants). */
  variantId?: string;
  colorName?: string;
  colorHex?: string;
  sizeNumber?: string;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
}

export interface CartContextType {
  cart: Cart;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCart: Dispatch<SetStateAction<Cart>>;
}

export interface CartResponse {
  statusCode?: number;
  data: { cart?: Cart; [key: string]: unknown };
  message?: string;
  success: boolean;
}

// ── Cart preview (POST /products/cart-preview) ──────────────────────────────
// Live offer/flash pricing for the cart, computed server-side. Shipping is not
// known yet, so only the merchandise total is returned; free shipping is a flag.
export interface CartPreviewItem {
  productId: string;
  variantId: string;
  quantity: number;
  productName: string;
  /** Post-flash unit price / line total. */
  itemPrice: number;
  totalPrice: number;
  /** Pre-flash live unit price / line total (what each row shows). */
  listedUnitPrice: number;
  listedLineTotal: number;
  size?: string;
  color?: string;
}

export interface CartPreviewOfferRef {
  _id: string;
  title: string;
  offerType: string;
}

export interface CartPreview {
  items: CartPreviewItem[];
  /** Merchandise subtotal AFTER flash discounts. */
  subTotal: number;
  appliedOffer:
    | { _id: string; title: string; offerType: string; savedAmount: number }
    | null;
  flashSale: { offers: CartPreviewOfferRef[]; savedAmount: number };
  /** Order-level offer discount (excludes flash savings). */
  discount: number;
  /** True when a free-shipping offer qualifies (final cost resolved at checkout). */
  freeShipping: boolean;
  totalSaved: number;
  /** subTotal − discount. Shipping is added at checkout. */
  merchandiseTotal: number;
}
