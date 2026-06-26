import AccountOrders from "@/components/account/AccountOrders";

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl text-heading">My Orders</h1>
      <AccountOrders />
    </div>
  );
}
