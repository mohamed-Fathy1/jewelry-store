"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const bestSellers = [
  {
    id: "1",
    name: "Classic Diamond Ring",
    price: 2499.99,
    image: "/images/products/ring-2.jpg",
    category: "Rings",
    href: "/product/1",
  },
  {
    id: "2",
    name: "Pearl Necklace",
    price: 899.99,
    image: "/images/products/necklace-2.jpg",
    category: "Necklaces",
    href: "/product/2",
  },
  {
    id: "3",
    name: "Diamond Studs",
    price: 1299.99,
    image: "/images/products/earrings-2.jpg",
    category: "Earrings",
    href: "/product/3",
  },
  {
    id: "4",
    name: "Gold Bangle",
    price: 699.99,
    image: "/images/products/bracelet-2.jpg",
    category: "Bracelets",
    href: "/product/4",
  },
  // Add more products as needed
];

export default function BestSellers() {
  const addToCart = (productName: string) => {
    toast.success(`${productName} added to cart`);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-light text-center mb-12">Best Sellers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {bestSellers.map((product) => (
          <motion.div key={product.id} whileHover={{ y: -5 }} className="group">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
              <Image
                src={product.image}
                alt={product.name}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
              <motion.button
                initial={{ opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                animate={{ opacity: 1 }}
                onClick={() => addToCart(product.name)}
                className="absolute bottom-4 right-4 p-2 rounded-full bg-black text-white shadow-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <ShoppingBagIcon className="w-5 h-5" />
              </motion.button>
            </div>
            <Link href={product.href}>
              <div className="mt-4 space-y-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">{product.category}</p>
                <p className="text-lg font-semibold">${product.price}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link
          href="/shop"
          className="inline-block bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors duration-200"
        >
          View All Products
        </Link>
      </div>
    </section>
  );
}
