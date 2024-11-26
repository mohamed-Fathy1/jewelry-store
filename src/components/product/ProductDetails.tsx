"use client";

import { useState } from "react";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";
import { HeartIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function ProductDetails({ productId }: { productId: string }) {
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // This would typically come from an API
  const product = {
    id: productId,
    name: "Diamond Pendant Necklace",
    price: 999.99,
    description:
      "Elegant diamond pendant crafted in 18k gold. This stunning piece features a brilliant-cut diamond suspended from a delicate gold chain.",
    images: [
      "/images/products/necklace-1.jpg",
      "/images/products/necklace-2.jpg",
    ],
    sizes: ['16"', '18"', '20"', '22"'],
    rating: 4.5,
    reviews: 12,
    material: "18k Gold",
    inStock: true,
  };

  const addToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    toast.success("Added to cart");
  };

  const addToWishlist = () => {
    toast.success("Added to wishlist");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Image gallery */}
      <div className="space-y-4">
        {product.images.map((image, index) => (
          <div key={index} className="aspect-square rounded-lg overflow-hidden">
            <Image
              src={image}
              alt={`${product.name} - View ${index + 1}`}
              width={600}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Product info */}
      <div className="space-y-6">
        <h1 className="text-3xl font-light">{product.name}</h1>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400"
                    : "text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-gray-500">({product.reviews} reviews)</span>
        </div>
        <p className="text-2xl font-medium">${product.price}</p>
        <p className="text-gray-600">{product.description}</p>

        {/* Material */}
        <div>
          <h3 className="text-sm font-medium text-gray-900">Material</h3>
          <p className="mt-2 text-gray-600">{product.material}</p>
        </div>

        {/* Size selector */}
        <div>
          <h3 className="text-sm font-medium text-gray-900">Size</h3>
          <div className="grid grid-cols-4 gap-4 mt-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                className={`border rounded-md py-2 text-sm ${
                  selectedSize === size
                    ? "border-black"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity and Add to cart */}
        <div className="flex space-x-4">
          <div className="w-32">
            <label className="text-sm font-medium text-gray-900">
              Quantity
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 py-2"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={addToCart}
            className="flex-1 bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            Add to Cart
          </button>
          <button
            onClick={addToWishlist}
            className="p-3 border border-gray-300 rounded-md hover:border-gray-400"
          >
            <HeartIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
