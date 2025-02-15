export interface Shipping {
  _id: string;
  category: string;
  cost: number;
}

export interface ShippingResponse {
  statusCode: number;
  data: {
    shipping: Shipping;
  };
  message: string;
  success: boolean;
}

export interface ShippingsResponse {
  statusCode: number;
  data: {
    shipping: Shipping[];
  };
  message: string;
  success: boolean;
}
