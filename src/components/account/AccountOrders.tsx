"use client";

import { colors } from "@/constants/colors";
import Image from "next/image";
import Link from "next/link";

// Mock orders data - replace with actual API call
const orders = [
  {
    id: "ORD123456789",
    date: "2024-02-15",
    status: "Delivered",
    total: 1599.98,
    items: [
      {
        id: "1",
        name: "Diamond Pendant Necklace",
        price: 999.99,
        image: "/images/IMG_2953.JPG",
        quantity: 1,
      },
      {
        id: "2",
        name: "Gold Bracelet",
        price: 599.99,
        image: "/images/IMG_3176.PNG",
        quantity: 1,
      },
    ],
  },
  {
    id: "ORD987654321",
    date: "2024-02-10",
    status: "Processing",
    total: 899.99,
    items: [
      {
        id: "3",
        name: "Pearl Earrings",
        price: 899.99,
        image: "/images/IMG_3177.PNG",
        quantity: 1,
      },
    ],
  },
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function AccountOrders() {
  return (
    <div className="space-y-8">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-lg p-6"
          style={{ backgroundColor: colors.background }}
        >
          {/* Order Header */}
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Order placed
              </p>
              <p className="font-medium" style={{ color: colors.textPrimary }}>
                {new Date(order.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Order number
              </p>
              <p className="font-medium" style={{ color: colors.textPrimary }}>
                {order.id}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Total
              </p>
              <p className="font-medium" style={{ color: colors.textPrimary }}>
                ${order.total.toFixed(2)}
              </p>
            </div>
            <div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-20 h-20 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className="font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    {item.name}
                  </h3>
                  <p style={{ color: colors.textSecondary }}>
                    Quantity: {item.quantity}
                  </p>
                  <p className="mt-1" style={{ color: colors.textPrimary }}>
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Actions */}
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href={`/account/orders/${order.id}`}
              className="px-4 py-2 rounded-md transition-colors duration-200"
              style={{
                backgroundColor: colors.brown,
                color: colors.textLight,
              }}
            >
              Track Order
            </Link>
            <button
              className="px-4 py-2 rounded-md border transition-colors duration-200"
              style={{
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
            >
              View Invoice
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
