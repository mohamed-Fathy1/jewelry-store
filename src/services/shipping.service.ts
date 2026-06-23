import axios from "axios";
import { ShippingsResponse } from "@/types/shipping.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Public read-only shipping costs (governorate prices). Unauthed instance.
const axiosInstance = axios.create({ baseURL: API_URL });

export const shippingService = {
  async getShipping(): Promise<ShippingsResponse> {
    const response = await axiosInstance.get<ShippingsResponse>("/shipping");
    return response.data;
  },
};
