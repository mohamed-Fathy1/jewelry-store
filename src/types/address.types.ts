export interface Address {
  _id?: string;
  firstName: string;
  lastName: string;
  apartmentSuite?: string;
  shipping: string;
  address: string;
  postalCode: string;
  primaryPhone: string;
  secondaryPhone?: string;
  isDefault?: boolean;
}
