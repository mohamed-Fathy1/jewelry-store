"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import { Product } from "@/types/product.types";
import { useCart } from "@/contexts/CartContext";
import { CartItem } from "@/types/cart.types";

interface ProductCardProps {
  product: Product;
}

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-lg bg-gray-200 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
}

function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      productId: product._id,
      quantity: 1,
      price: product.salePrice || product.price,
      productName: product.productName,
      productImage: product.defaultImage.mediaUrl,
    };

    addToCart(cartItem);
  };

  return (
    <motion.div whileHover={{ y: -5 }} className="group">
      <div className="aspect-square rounded-lg overflow-hidden relative">
        <Image
          src={product.defaultImage.mediaUrl}
          alt={product.productName}
          fill
          className="object-cover"
        />
        {product.discountPercentage > 0 && (
          <div
            className="absolute top-4 left-4 px-2 py-1 rounded-md text-sm font-medium"
            style={{
              backgroundColor: colors.brown,
              color: colors.textLight,
            }}
          >
            {product.discountPercentage}% OFF
          </div>
        )}
        <motion.button
          initial={{ opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          animate={{ opacity: 1 }}
          onClick={handleAddToCart}
          className="absolute bottom-4 right-4 p-2 rounded-full shadow-lg transition-colors duration-200"
          style={{
            backgroundColor: colors.brown,
            color: colors.textLight,
          }}
        >
          <ShoppingBagIcon className="w-5 h-5" />
        </motion.button>
      </div>

      <Link href={`/product/${product._id}`}>
        <div className="mt-4 space-y-1">
          <h3
            className="text-lg font-medium"
            style={{ color: colors.textPrimary }}
          >
            {product.productName}
          </h3>
          <p style={{ color: colors.textSecondary }}>
            {typeof product.category === "object"
              ? product.category.categoryName
              : ""}
          </p>
          <div className="flex items-center space-x-2">
            <p
              className="text-lg font-semibold"
              style={{ color: colors.brown }}
            >
              EGP {(product.salePrice || product.price).toLocaleString()}
            </p>
            {product.salePrice > 0 && (
              <p
                className="text-sm line-through"
                style={{ color: colors.textSecondary }}
              >
                EGP {product.price.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Add Skeleton to ProductCard
ProductCard.Skeleton = ProductCardSkeleton;

export default ProductCard;
