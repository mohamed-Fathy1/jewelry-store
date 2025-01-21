"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useProduct } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { colors } from "@/constants/colors";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { CartItem } from "@/types/cart.types";
import { Button } from "../ui/Button";
import { useRouter } from "next/navigation";

export default function ProductDetails({ productId }: { productId: string }) {
  const { currentProduct, getOneProduct, isLoading } = useProduct();
  const { addToCart } = useCart();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    getOneProduct(productId);
  }, [getOneProduct, productId]);

  useEffect(() => {
    if (currentProduct?.defaultImage) {
      setSelectedImage(currentProduct.defaultImage.mediaUrl);
    }
  }, [currentProduct]);

  const handleAddToCart = () => {
    if (!currentProduct) return;

    const cartItem: CartItem = {
      productId: currentProduct._id,
      quantity,
      price: currentProduct.salePrice || currentProduct.price,
      productName: currentProduct.productName,
      productImage: currentProduct.defaultImage.mediaUrl,
    };

    addToCart(cartItem);
  };

  const handleBuyNow = () => {
    if (!currentProduct) return;

    const cartItem: CartItem = {
      productId: currentProduct._id,
      quantity,
      price: currentProduct.salePrice || currentProduct.price,
      productName: currentProduct.productName,
      productImage: currentProduct.defaultImage.mediaUrl,
    };

    addToCart(cartItem);
    router.push("/checkout");
  };

  const incrementQuantity = () => {
    if (currentProduct && quantity < currentProduct.availableItems) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  if (isLoading || !currentProduct) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="aspect-square rounded-lg overflow-hidden">
          <Image
            src={selectedImage}
            alt={currentProduct.productName}
            width={600}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {currentProduct.albumImages.map((image) => (
            <button
              key={image._id}
              onClick={() => setSelectedImage(image.mediaUrl)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                selectedImage === image.mediaUrl
                  ? "border-brown"
                  : "border-transparent"
              }`}
            >
              <Image
                src={image.mediaUrl}
                alt={currentProduct.productName}
                width={150}
                height={150}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h1
          className="text-3xl font-light"
          style={{ color: colors.textPrimary }}
        >
          {currentProduct.productName}
        </h1>
        <p style={{ color: colors.textSecondary }}>
          {currentProduct.productDescription}
        </p>
        <div className="space-y-2">
          <p className="text-2xl font-semibold" style={{ color: colors.brown }}>
            EGP{" "}
            {(
              currentProduct.salePrice || currentProduct.price
            ).toLocaleString()}
          </p>
          {currentProduct.salePrice > 0 && (
            <p
              className="text-lg line-through"
              style={{ color: colors.textSecondary }}
            >
              EGP {currentProduct.price.toLocaleString()}
            </p>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center space-x-4">
          <span style={{ color: colors.textSecondary }}>Quantity:</span>
          <div
            className="flex items-center border rounded-md"
            style={{ borderColor: colors.border }}
          >
            <button
              onClick={decrementQuantity}
              className="px-3 py-1 transition-colors hover:bg-gray-100"
              style={{ color: colors.textPrimary }}
            >
              -
            </button>
            <span
              className="px-4 py-1 border-x"
              style={{ borderColor: colors.border }}
            >
              {quantity}
            </span>
            <button
              onClick={incrementQuantity}
              className="px-3 py-1 transition-colors hover:bg-gray-100"
              style={{ color: colors.textPrimary }}
            >
              +
            </button>
          </div>
        </div>

        <div>
          <p style={{ color: colors.textSecondary }}>
            Availability:{" "}
            {currentProduct.availableItems > 0
              ? `${currentProduct.availableItems} in stock`
              : "Out of Stock"}
          </p>
        </div>

        <div className="flex flex-col">
          <button
            onClick={handleAddToCart}
            disabled={currentProduct.availableItems === 0}
            className="w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors duration-200 disabled:opacity-50 mb-3"
            style={{ backgroundColor: colors.brown, color: colors.textLight }}
          >
            <ShoppingBagIcon className="w-5 h-5" />
            <span>Add to Cart</span>
          </button>

          <button
            onClick={handleBuyNow}
            disabled={currentProduct.availableItems === 0}
            className="w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors duration-200 disabled:opacity-50"
            style={{
              backgroundColor: colors.background,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
            }}
          >
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
