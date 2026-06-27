import React, { createContext, useContext, useState } from "react";
import { Address } from "@/types/address.types";
import { Shipping } from "@/types/shipping.types";

// Shapes submitted by ShippingForm / PaymentForm (kept structurally compatible
// with their local interfaces).
export interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentFormData {
  paymentMethod: string;
}

interface CheckoutContextType {
  shippingData: ShippingFormData | null;
  paymentData: PaymentFormData | null;
  selectedAddress: Address | null;
  setShippingData: (data: ShippingFormData) => void;
  setPaymentData: (data: PaymentFormData) => void;
  setSelectedAddress: (address: Address) => void;
  selectedShipping: Shipping | null;
  setSelectedShipping: (shipping: Shipping | null) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(
    null
  );
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<Shipping | null>(
    null
  );

  return (
    <CheckoutContext.Provider
      value={{
        shippingData,
        paymentData,
        selectedAddress,
        setShippingData,
        setPaymentData,
        setSelectedAddress,
        selectedShipping,
        setSelectedShipping,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};
