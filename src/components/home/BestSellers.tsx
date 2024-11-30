"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { colors } from "@/constants/colors";

const bestSellers = [
  {
    id: "1",
    name: "Classic Diamond Ring",
    originalPrice: 2999.99,
    salePrice: 2499.99,
    image: "/images/IMG_1858.JPG",
    category: "Rings",
    href: "/product/1",
    badge: "Best Seller",
  },
  {
    id: "2",
    name: "Pearl Necklace",
    originalPrice: 1299.99,
    salePrice: 899.99,
    image: "/images/IMG_2950.JPG",
    category: "Necklaces",
    href: "/product/2",
    badge: "Limited Time",
  },
  {
    id: "3",
    name: "Diamond Studs",
    originalPrice: 1599.99,
    salePrice: 1299.99,
    image: "/images/IMG_3177.PNG",
    category: "Earrings",
    href: "/product/3",
    badge: "Sale",
  },
  {
    id: "4",
    name: "Gold Bangle",
    originalPrice: 899.99,
    salePrice: 699.99,
    image: "/images/IMG_3176.PNG",
    category: "Bracelets",
    href: "/product/4",
    badge: "Trending",
  },
];

export default function BestSellers() {
  const addToCart = (productName: string) => {
    toast.success(`${productName} added to cart`);
  };

  const calculateDiscount = (original: number, sale: number) => {
    return Math.round(((original - sale) / original) * 100);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      style={{ backgroundColor: colors.background }}
    >
      <h2
        className="text-3xl font-light text-center mb-12"
        style={{ color: colors.textPrimary }}
      >
        Special Offers
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {bestSellers.map((product) => (
          <motion.div key={product.id} whileHover={{ y: -5 }} className="group">
            <div className="aspect-square rounded-lg overflow-hidden relative">
              <Image
                src={product.image}
                alt={product.name}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute top-4 left-4 px-2 py-1 rounded-md text-sm font-medium"
                style={{
                  backgroundColor: colors.brown,
                  color: colors.textLight,
                }}
              >
                {calculateDiscount(product.originalPrice, product.salePrice)}%
                OFF
              </div>
              <div
                className="absolute top-4 right-4 px-2 py-1 rounded-md text-sm font-medium"
                style={{
                  backgroundColor: colors.gold,
                  color: colors.textLight,
                }}
              >
                {product.badge}
              </div>
              <motion.button
                initial={{ opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                animate={{ opacity: 1 }}
                onClick={() => addToCart(product.name)}
                className="absolute bottom-4 right-4 p-2 rounded-full shadow-lg transition-colors duration-200"
                style={{
                  backgroundColor: colors.brown,
                  color: colors.textLight,
                }}
              >
                <ShoppingBagIcon className="w-5 h-5" />
              </motion.button>
            </div>
            <Link href={product.href}>
              <div className="mt-4 space-y-1">
                <h3
                  className="text-lg font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  {product.name}
                </h3>
                <p style={{ color: colors.textSecondary }}>
                  {product.category}
                </p>
                <div className="flex items-center space-x-2">
                  <p
                    className="text-lg font-semibold"
                    style={{ color: colors.brown }}
                  >
                    {formatPrice(product.salePrice)}
                  </p>
                  <p
                    className="text-sm line-through"
                    style={{ color: colors.textSecondary }}
                  >
                    {formatPrice(product.originalPrice)}
                  </p>
                  <p className="text-sm" style={{ color: colors.gold }}>
                    Save{" "}
                    {formatPrice(product.originalPrice - product.salePrice)}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link
          href="/shop"
          className="inline-block px-8 py-3 rounded-md transition-colors duration-200"
          style={{
            backgroundColor: colors.brown,
            color: colors.textLight,
          }}
        >
          View All Offers
        </Link>
      </div>
    </section>
  );
}
