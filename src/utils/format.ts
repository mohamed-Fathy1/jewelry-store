export const formatPrice = (price: number) => {
  return price?.toLocaleString("en-US", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Compact EGP for the admin orders UI: "EGP 1,234" (comma separators, no
// decimals) per the orders design spec.
export const formatEGP = (amount: number) => {
  return `EGP ${Math.round(amount ?? 0).toLocaleString("en-US")}`;
};
