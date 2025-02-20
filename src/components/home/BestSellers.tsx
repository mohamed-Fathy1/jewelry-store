"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { colors } from "@/constants/colors";
import { useProduct } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { CartItem } from "@/types/cart.types";

function ProductSkeleton() {
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

export default function BestSellers() {
  const { saleProducts, getAllSaleProducts, isLoading } = useProduct();
  const { addToCart } = useCart();

  useEffect(() => {
    getAllSaleProducts();
  }, [getAllSaleProducts]);

  const handleAddToCart = (product: Product) => {
    const cartItem: CartItem = {
      productId: product._id,
      quantity: 1,
      price: product.salePrice || product.price,
      productName: product.productName,
      productImage: product.defaultImage.mediaUrl,
      availableItems: product.availableItems,
    };

    addToCart(cartItem);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Limit to 5 items
  const limitedProducts = saleProducts.slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2
        className="text-3xl font-light text-center mb-12"
        style={{ color: colors.textPrimary }}
      >
        Special Offers
      </h2>
      <div className="grid grid-cols-1 :grid-cols-2 xl:grid-cols-4 grid-rows-1 gap-8">
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, index) => <ProductSkeleton key={index} />)
          : limitedProducts.map((product) => (
              <motion.div
                key={product._id}
                whileHover={{ y: -5 }}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Link href={`/product/${product._id}`}>
                  <div className="aspect-square rounded-lg overflow-hidden relative">
                    <Image
                      src={product.defaultImage.mediaUrl}
                      alt={product.productName}
                      width={500}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                    {product.discountPercentage > 0 && (
                      <div
                        className="absolute top-4 left-4 px-2 py-1 rounded-md text-sm font-medium"
                        style={{
                          backgroundColor: colors.brown,
                          color: colors.textLight,
                        }}
                      >
                        {Math.round(product.discountPercentage)}% OFF
                      </div>
                    )}
                    {product.isSale && (
                      <div
                        className="absolute top-4 right-4 px-2 py-1 rounded-md text-sm font-medium"
                        style={{
                          backgroundColor: colors.gold,
                          color: colors.textLight,
                        }}
                      >
                        Sale
                      </div>
                    )}
                    <motion.button
                      initial={{ opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      animate={{ opacity: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      className="absolute bottom-4 right-4 p-2 rounded-full shadow-lg transition-colors duration-200"
                      style={{
                        backgroundColor: colors.brown,
                        color: colors.textLight,
                      }}
                    >
                      <ShoppingBagIcon className="w-5 h-5" />
                    </motion.button>
                  </div>
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
                        {formatPrice(product.salePrice || product.price)}
                      </p>
                      {product.salePrice > 0 && (
                        <>
                          <p
                            className="text-sm line-through"
                            style={{ color: colors.textSecondary }}
                          >
                            {formatPrice(product.price)}
                          </p>
                          <p className="text-sm" style={{ color: colors.gold }}>
                            Save{" "}
                            {formatPrice(product.price - product.salePrice)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
      </div>
      <div className="text-center mt-12">
        <Link
          href="/shop?sale=true"
          className="inline-block px-8 py-3 rounded-md transition-colors duration-200"
          style={{ backgroundColor: colors.brown, color: colors.textLight }}
        >
          View All Offers
        </Link>
      </div>
    </section>
  );
}
