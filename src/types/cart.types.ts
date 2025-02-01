export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  productImage: string;
  availableItems: number;
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
}
