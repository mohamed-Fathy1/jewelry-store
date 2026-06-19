"use client";

import { useState, useRef } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import ProductList, {
  ProductListRef,
} from "@/components/admin/products/ProductList";
import ProductModal from "@/components/admin/products/ProductModal";
import ProductAnalytics from "@/components/admin/products/ProductAnalytics";
import { AdminProduct } from "@/types/admin-product.types";
import { Button, PageHeader } from "@/components/admin/ui";

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(
    null
  );
  const listRef = useRef<ProductListRef>(null);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    listRef.current?.fetchProducts();
  };

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your catalog, pricing, stock and best sellers."
        actions={
          <Button
            onClick={handleAddProduct}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            Add Product
          </Button>
        }
      />

      <ProductAnalytics />

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
