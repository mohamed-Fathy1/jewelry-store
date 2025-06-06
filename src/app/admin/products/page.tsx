"use client";

import { useState, useRef } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import ProductList, {
  ProductListRef,
} from "@/components/admin/products/ProductList";
import ProductModal from "@/components/admin/products/ProductModal";
import { colors } from "@/constants/colors";

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const listRef = useRef<ProductListRef>(null);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    listRef.current?.fetchProducts();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: colors.textPrimary }}
        >
          Products
        </h1>
        <button
          onClick={handleAddProduct}
          className="flex items-center px-4 py-2 rounded-md text-white"
          style={{ backgroundColor: colors.brown }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      <ProductList ref={listRef} onEdit={handleEditProduct} />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
