interface UserInformation {
  _id?: string;
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  governorate?: string;
  postalCode?: string;
  primaryPhone: string;
  secondaryPhone?: string;
}

interface Shipping {
  // Backend returns the shipping-zone label as `name` (e.g. "Cairo").
  name: string;
  category?: string; // legacy alias, kept for back-compat
  cost: number;
}

interface OrderProduct {
  productId:
    | {
        defaultImage: {
          mediaUrl: string;
          mediaId: string;
        };
        _id: string;
        id: string;
      }
    | string;
  variantId?: string;
  productName: string;
  quantity: number;
  itemPrice: number;
  totalPrice: number;
  size?: string;
  color?: string;
  isFreeGift?: boolean;
  _id?: string;
}

export interface Order {
  _id: string;
  user: string;
  userInformation: UserInformation;
  shipping: Shipping;
  products: OrderProduct[];
  // Money fields as returned by the backend order document.
  subTotal?: number;
  discount?: number;
  freeShipping?: boolean;
  shippingCost?: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  statusCode: number;
  data: {
    orders: Order[];
  };
  message: string;
  success: boolean;
}

export interface OrderResponse {
  statusCode: number;
  data: {
    order: Order;
  };
  message: string;
  success: boolean;
}
