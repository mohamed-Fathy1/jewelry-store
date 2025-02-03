"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useProduct } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { colors } from "@/constants/colors";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { CartItem } from "@/types/cart.types";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  HeartIcon,
  Pause,
  Play,
} from "lucide-react";
import { wishlistService } from "@/services/wishlist.service";
import toast from "react-hot-toast";
import { useWishlist } from "@/contexts/WishlistContext";
import LoadingSpinner from "../../components/LoadingSpinner"; // Import the new loading component

export default function ProductDetails({ productId }: { productId: string }) {
  const { currentProduct, getOneProduct, isLoading } = useProduct();
  const { addToCart } = useCart();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const sliderRef = useRef<NodeJS.Timeout | null>(null);
  const { wishlist, toggleWishlist } = useWishlist();
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    getOneProduct(productId);
  }, [getOneProduct, productId]);

  useEffect(() => {
    if (currentProduct?.defaultImage) {
      setSelectedImage(currentProduct.defaultImage.mediaUrl);
      if (currentProduct.isSoldOut) setQuantity(0);
    }
  }, [currentProduct]);

  useEffect(() => {
    const checkWishlist = () => {
      if (!currentProduct) return;
      setIsInWishlist(wishlist.includes(currentProduct._id));
    };

    checkWishlist();
  }, [currentProduct, wishlist]);

  // Auto-rotate images every 3 seconds if autoPlay is true
  useEffect(() => {
    if (!autoPlay) return;

    sliderRef.current = setInterval(() => {
      setActiveImage((current) =>
        current === currentProduct.albumImages.length - 1 ? 0 : current + 1
      );
    }, 3000);

    return () => clearInterval(sliderRef.current);
  }, [autoPlay, currentProduct?.albumImages.length]);

  const handleAddToCart = () => {
    if (!currentProduct) return;

    const cartItem: CartItem = {
      productId: currentProduct._id,
      quantity,
      price: currentProduct.salePrice || currentProduct.price,
      productName: currentProduct.productName,
      productImage: currentProduct.defaultImage.mediaUrl,
      availableItems: currentProduct.availableItems,
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

  const addToWishlist = () => {
    if (!currentProduct) return;

    toggleWishlist(currentProduct._id);
  };

  if (isLoading || !currentProduct) {
    return <LoadingSpinner />; // Updated loading return
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Image gallery */}
      <div className="space-y-2">
        {/* Main image */}
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
          <Image
            src={currentProduct.albumImages[activeImage].mediaUrl}
            alt={`${currentProduct.productName} - Main View`}
            width={1000}
            height={1000}
            className="w-full h-full object-cover transition-opacity duration-500"
            priority
          />

          {/* Previous/Next buttons */}
          <button
            onClick={() => {
              clearInterval(sliderRef.current);
              setAutoPlay(false);
              setActiveImage((prev) =>
                prev === 0 ? currentProduct.albumImages.length - 1 : prev - 1
              );
            }}
            className="absolute flex justify-center items-center h-10 w-10 left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => {
              clearInterval(sliderRef.current);
              setAutoPlay(false);
              setActiveImage((next) =>
                next === currentProduct.albumImages.length - 1 ? 0 : next + 1
              );
            }}
            className="absolute flex justify-center items-center h-10 w-10 right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <ChevronRight />
          </button>

          {/* Auto-play toggle */}
          <button
            onClick={() => setAutoPlay((prev) => !prev)}
            className="absolute flex justify-center items-center w-10 h-10 bottom-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            {autoPlay ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-2 overflow-x-auto p-2">
          {currentProduct.albumImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`flex-none relative aspect-square w-20 rounded-md overflow-hidden 
                ${
                  activeImage === index ? "ring-2 ring-blue-500" : "opacity-70"
                }`}
            >
              <Image
                src={image.mediaUrl}
                alt={`${currentProduct.productName} - Thumbnail ${index + 1}`}
                width={80}
                height={80}
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
              style={{
                borderColor: colors.border,
                color:
                  quantity >= currentProduct.availableItems
                    ? colors.textSecondary
                    : colors.accentDark,
              }}
            >
              {quantity}
            </span>
            <button
              onClick={incrementQuantity}
              className="px-3 py-1 transition-colors hover:bg-gray-100"
              style={{ color: colors.textPrimary }}
              disabled={quantity >= currentProduct.availableItems}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p style={{ color: colors.textSecondary }}>
            Availability:{" "}
            {currentProduct.availableItems > 0
              ? `${currentProduct.availableItems} in stock`
              : "Out of Stock"}
          </p>

          <button
            onClick={addToWishlist}
            className="p-3 border rounded-md transition-colors duration-200"
            style={{
              borderColor: colors.border,
              color: colors.textPrimary,
              backgroundColor: colors.background,
            }}
          >
            <HeartIcon
              className={`w-6 h-6 ${
                isInWishlist ? "text-red-500 fill-red-500" : ""
              }`}
            />
          </button>
        </div>

        {currentProduct.availableItems === 0 && (
          <div
            className="text-center p-4 rounded-md"
            style={{
              backgroundColor: colors.background,
              border: `1px solid ${colors.border}`,
            }}
          >
            <p style={{ color: colors.textSecondary }}>
              This product is currently sold out. Add it to your wishlist to be
              notified when it's back in stock!
            </p>
          </div>
        )}

        <div className="flex flex-col">
          <button
            onClick={handleAddToCart}
            disabled={currentProduct.availableItems === 0}
            className="w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors duration-200 disabled:opacity-50 mb-3"
            style={{ backgroundColor: colors.brown, color: colors.textLight }}
          >
            <ShoppingBagIcon className="w-5 h-5" />
            <span>
              {currentProduct.availableItems === 0 ? "Sold Out" : "Add to Cart"}
            </span>
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
            <span>
              {currentProduct.availableItems === 0 ? "Sold Out" : "Buy Now"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
