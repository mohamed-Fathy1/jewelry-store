interface UserInformation {
  country: string;
  address: string;
  governorate: string;
  primaryPhone: string;
}

interface Shipping {
  category: string;
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
  productName: string;
  quantity: number;
  itemPrice: number;
  totalPrice: number;
  _id?: string;
}

export interface Order {
  _id: string;
  user: string;
  userInformation: UserInformation;
  shipping: Shipping;
  products: OrderProduct[];
  price: number;
  status: "under_review" | "confirmed" | "cancelled" | "delivered";
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
