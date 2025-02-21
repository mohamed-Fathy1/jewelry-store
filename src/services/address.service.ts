import axios from "axios";
import { Address, AddressResponse } from "@/types/address.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const addressService = {
  async getAllAddresses(): Promise<AddressResponse> {
    const response = await axiosInstance.get<AddressResponse>(
      `/user/addresses`
    );
    return response.data;
  },

  async addAddress(
    addressData: Omit<Address, "_id">
  ): Promise<AddressResponse> {
    const response = await axiosInstance.post<AddressResponse>(
      `/user/add-address`,
      addressData
    );
    return response.data;
  },

  async updateAddress(
    addressId: string,
    addressData: Partial<Address>
  ): Promise<AddressResponse> {
    const response = await axiosInstance.patch<AddressResponse>(
      `/user/update-address/${addressId}`,
      addressData
    );
    return response.data;
  },

  async deleteAddress(addressId: string): Promise<AddressResponse> {
    const response = await axiosInstance.delete<AddressResponse>(
      `/user/delete-address/${addressId}`
    );
    return response.data;
  },

  async setDefaultAddress(addressId: string): Promise<AddressResponse> {
    const response = await axiosInstance.patch<AddressResponse>(
      `/user/set-default-address/${addressId}`
    );
    return response.data;
  },
};
