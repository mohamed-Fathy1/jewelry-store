export interface Address {
  _id?: string;
  firstName: string;
  lastName: string;
  apartmentSuite?: string;
  // Populated Shipping object on reads, id string on writes — varies by source.
  shipping: any;
  address: string;
  postalCode: string;
  primaryPhone: string;
  secondaryPhone?: string;
  isDefault?: boolean;
  // Optional fields used across checkout/profile views (shape varies by source).
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  governorate?: string;
}

export interface AddressResponse {
  statusCode?: number;
  data: {
    address?: Address;
    addresses?: Address[];
    [key: string]: unknown;
  };
  message?: string;
  success: boolean;
}
