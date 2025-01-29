export interface Address {
  _id?: string;
  firstName: string;
  lastName: string;
  apartmentSuite?: string;
  governorate: string;
  address: string;
  postalCode: string;
  primaryPhone: string;
  secondaryPhone?: string;
  isDefault?: boolean;
}
