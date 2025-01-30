import React, { createContext, useContext, useState } from "react";
import { Address } from "@/types/address.types";

interface CheckoutContextType {
  shippingData: ShippingFormData | null;
  paymentData: PaymentFormData | null;
  selectedAddress: Address | null;
  setShippingData: (data: ShippingFormData) => void;
  setPaymentData: (data: PaymentFormData) => void;
  setSelectedAddress: (address: Address) => void;
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
  const [selectedShipping, setSelectedShipping] = useState<string>("");

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
