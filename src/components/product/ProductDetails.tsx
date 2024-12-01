"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";
import { HeartIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { colors } from "@/constants/colors";

export default function ProductDetails({ productId }: { productId: string }) {
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const sliderRef = useRef<NodeJS.Timeout | null>(null);
  // This would typically come from an API
  const product = {
    id: productId,
    name: "Diamond Pendant Necklace",
    price: 999.99,
    description:
      "Elegant diamond pendant crafted in 18k gold. This stunning piece features a brilliant-cut diamond suspended from a delicate gold chain.",
    images: [
      "/images/IMG_2953.JPG",
      "/images/IMG_2950.JPG",
      "/images/IMG_3095.JPG",
    ],
    sizes: ['16"', '18"', '20"', '22"'],
    rating: 4.5,
    reviews: 12,
    material: "18k Gold",
    inStock: true,
  };

  // Auto-rotate images every 3 seconds if autoPlay is true
  useEffect(() => {
    if (!autoPlay) return;

    sliderRef.current = setInterval(() => {
      setActiveImage((current) =>
        current === product.images.length - 1 ? 0 : current + 1
      );
    }, 3000);

    return () => clearInterval(sliderRef.current);
  }, [autoPlay, product.images.length]);

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
        {/* Main image */}
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
          <Image
            src={product.images[activeImage]}
            alt={`${product.name} - Main View`}
            width={1000}
            height={1000}
            className="w-full h-full object-cover transition-opacity duration-500"
            priority
          />

          {/* Previous/Next buttons */}
          <button
            onClick={() => {
              if (sliderRef.current) {
                clearInterval(sliderRef.current);
              }
              setAutoPlay(false);
              setActiveImage((prev) =>
                prev === 0 ? product.images.length - 1 : prev - 1
              );
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            ←
          </button>
          <button
            onClick={() => {
              if (sliderRef.current) {
                clearInterval(sliderRef.current);
              }
              setAutoPlay(false);
              setActiveImage((next) =>
                next === product.images.length - 1 ? 0 : next + 1
              );
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            →
          </button>

          {/* Auto-play toggle */}
          <button
            onClick={() => setAutoPlay((prev) => !prev)}
            className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            {autoPlay ? "⏸" : "▶"}
          </button>
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {product.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`flex-none relative aspect-square w-20 rounded-md overflow-hidden 
                ${
                  activeImage === index ? "ring-2 ring-blue-500" : "opacity-70"
                }`}
            >
              <Image
                src={image}
                alt={`${product.name} - Thumbnail ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product info */}
      <div className="space-y-6">
        <h1
          className="text-3xl font-light"
          style={{ color: colors.textPrimary }}
        >
          {product.name}
        </h1>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className="h-5 w-5"
                style={{
                  color:
                    i < Math.floor(product.rating)
                      ? colors.gold
                      : colors.border,
                }}
              />
            ))}
          </div>
          <span style={{ color: colors.textSecondary }}>
            ({product.reviews} reviews)
          </span>
        </div>
        <p
          className="text-2xl font-medium"
          style={{ color: colors.textPrimary }}
        >
          ${product.price}
        </p>
        <p style={{ color: colors.textSecondary }}>{product.description}</p>

        {/* Material */}
        <div>
          <h3
            className="text-base font-medium"
            style={{ color: colors.textPrimary }}
          >
            Material
          </h3>
          <p className="mt-2" style={{ color: colors.textSecondary }}>
            {product.material}
          </p>
        </div>

        {/* Size selector */}
        <div>
          <h3
            className="text-base font-medium"
            style={{ color: colors.textPrimary }}
          >
            Size
          </h3>
          <div className="grid grid-cols-4 gap-4 mt-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                className="border rounded-md py-2 text-sm transition-colors duration-200"
                style={{
                  borderColor:
                    selectedSize === size ? colors.brown : colors.border,
                  color:
                    selectedSize === size ? colors.brown : colors.textSecondary,
                }}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity and Add to cart */}
        <div className="flex space-x-4">
          <div className="w-32 space-y-2">
            <label
              className="block text-sm font-medium"
              style={{ color: colors.textPrimary }}
            >
              Quantity
            </label>
            <div className="relative">
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="block w-full rounded-md border px-3 py-2 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-brown"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option
                    key={num}
                    value={num}
                    className="first:rounded-t-md last:rounded-b-md"
                  >
                    {num}
                  </option>
                ))}
              </select>
              <div
                className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2"
                style={{ color: colors.textPrimary }}
              >
                ▼
              </div>
            </div>
          </div>
          <button
            onClick={addToCart}
            className="flex-1 py-3 rounded-md transition-colors duration-200"
            style={{
              backgroundColor: colors.brown,
              color: colors.textLight,
            }}
          >
            Add to Cart
          </button>
          <button
            onClick={addToWishlist}
            className="p-3 border rounded-md transition-colors duration-200"
            style={{
              borderColor: colors.border,
              color: colors.textPrimary,
              backgroundColor: colors.background,
            }}
          >
            <HeartIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
