"use client";

import { useState } from "react";
import OrderList from "@/components/admin/orders/OrderList";
import { Order } from "@/types/order.types";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import { formatPrice } from "@/utils/format";
import Image from "next/image";

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: colors.textPrimary }}
        >
          Orders
        </h1>
      </div>

      <OrderList onViewDetails={handleViewDetails} />

      {/* Order Details Modal */}
      <Dialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg w-full max-w-3xl mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title
                className="text-xl font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Order Details
              </Dialog.Title>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Order Information</h3>
                    <p className="text-sm text-gray-600">
                      Order ID: #{selectedOrder._id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: {formatPrice(selectedOrder.price)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: {selectedOrder.status.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    {selectedOrder && selectedOrder.userInformation ? (
                      <div>
                        <h3 className="font-medium mb-2">
                          Customer Information
                        </h3>
                        <p className="text-sm text-gray-600">
                          Name: {selectedOrder.userInformation.firstName}{" "}
                          {selectedOrder.userInformation.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Phone: {selectedOrder.userInformation.primaryPhone}
                        </p>
                        <p className="text-sm text-gray-600">
                          Location: {selectedOrder.shipping.category},{" "}
                          {selectedOrder.userInformation.country}
                        </p>
                        <p className="text-sm text-gray-600">
                          Address: {selectedOrder.userInformation.address}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-medium mb-2">
                          Customer Information
                        </h3>
                        <p className="text-sm text-gray-600">
                          No customer information available
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Products List */}
                <div>
                  <h3 className="font-medium mb-2">Products</h3>
                  <div className="space-y-4">
                    {selectedOrder?.products?.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center border rounded-lg p-3"
                      >
                        {typeof product.productId === "object" && (
                          <div className="h-16 w-16 relative flex-shrink-0">
                            <Image
                              src={product?.productId?.defaultImage?.mediaUrl}
                              alt={product?.productName}
                              fill
                              className="rounded-md object-cover"
                            />
                          </div>
                        )}
                        <div className="ml-4 flex-1">
                          <p className="font-medium">{product?.productName}</p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-gray-600">
                              {product?.quantity} ×{" "}
                              {formatPrice(product?.itemPrice)}
                            </p>
                            <p className="font-medium">
                              {formatPrice(product?.totalPrice)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Information */}
                <div>
                  <h3 className="font-medium mb-2">Shipping Information</h3>
                  <p className="text-sm text-gray-600">
                    Method: {selectedOrder?.shipping?.category}
                  </p>
                  <p className="text-sm text-gray-600">
                    Cost: {formatPrice(selectedOrder?.shipping?.cost)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
