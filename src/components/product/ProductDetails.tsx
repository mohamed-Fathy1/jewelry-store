"use client";

import { useEffect, useRef, useState } from "react";
import { useProduct } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
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
import { cn } from "@/lib/cn";
import SmartImage from "@/components/ui/SmartImage";
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
      availableItems: currentProduct.availableItems ?? 0,
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
        <div className="relative aspect-[2.25/3] md:aspect-[4/3] rounded-2xl overflow-hidden bg-surface-muted">
          <SmartImage
            src={currentProduct.albumImages[activeImage].mediaUrl}
            alt={`${currentProduct.productName} - Main View`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={85}
            className="object-cover transition-opacity duration-500"
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
            aria-label="Previous image"
            className="absolute flex justify-center items-center h-10 w-10 left-2 top-1/2 -translate-y-1/2 rounded-full bg-noir/50 p-2 text-on-primary transition-colors hover:bg-noir/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
            aria-label="Next image"
            className="absolute flex justify-center items-center h-10 w-10 right-2 top-1/2 -translate-y-1/2 rounded-full bg-noir/50 p-2 text-on-primary transition-colors hover:bg-noir/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronRight />
          </button>

          {/* Auto-play toggle */}
          <button
            onClick={() => setAutoPlay((prev) => !prev)}
            aria-label={autoPlay ? "Pause slideshow" : "Play slideshow"}
            className="absolute flex justify-center items-center w-10 h-10 bottom-2 right-2 rounded-full bg-noir/50 p-2 text-on-primary transition-colors hover:bg-noir/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
              aria-label={`View ${currentProduct.productName} image ${
                index + 1
              }`}
              className={cn(
                "flex-none relative aspect-square w-20 overflow-hidden rounded-lg bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                activeImage === index ? "ring-2 ring-accent" : "opacity-70"
              )}
            >
              <SmartImage
                src={image.mediaUrl}
                alt={`${currentProduct.productName} - Thumbnail ${index + 1}`}
                fill
                sizes="80px"
                quality={75}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <h1 className="font-display text-3xl text-heading">
          {currentProduct.productName}
        </h1>
        <p className="text-ink-muted">{currentProduct.productDescription}</p>
        <div className="space-y-2">
          <p className="text-2xl font-semibold tabular-nums text-heading">
            EGP{" "}
            {(
              currentProduct.salePrice || currentProduct.price
            ).toLocaleString()}
          </p>
          {currentProduct.salePrice > 0 && (
            <p className="text-lg tabular-nums line-through text-ink-muted">
              EGP {currentProduct.price.toLocaleString()}
            </p>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center space-x-4">
          <span className="text-ink-muted">Quantity:</span>
          <div className="flex items-center rounded-lg border border-hairline">
            <button
              onClick={decrementQuantity}
              aria-label="Decrease quantity"
              className="px-3 py-1 text-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              -
            </button>
            <span
              className={cn(
                "px-4 py-1 border-x border-hairline tabular-nums",
                quantity >= currentProduct.availableItems
                  ? "text-ink-muted"
                  : "text-ink"
              )}
            >
              {quantity}
            </span>
            <button
              onClick={incrementQuantity}
              aria-label="Increase quantity"
              className="px-3 py-1 text-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              disabled={quantity >= currentProduct.availableItems}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-ink-muted">
            Availability:{" "}
            {currentProduct.availableItems > 0
              ? `${currentProduct.availableItems} in stock`
              : "Out of Stock"}
          </p>

          <button
            onClick={addToWishlist}
            aria-label={
              isInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
            aria-pressed={isInWishlist}
            className="rounded-lg border border-hairline bg-surface p-3 text-ink transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <HeartIcon
              className={cn(
                "w-6 h-6",
                isInWishlist && "fill-primary text-primary"
              )}
            />
          </button>
        </div>

        {currentProduct.availableItems === 0 && (
          <div className="rounded-lg border border-hairline bg-surface-muted p-4 text-center">
            <p className="text-ink-muted">
              This product is currently sold out. Add it to your wishlist to be
              notified when it's back in stock!
            </p>
          </div>
        )}

        <div className="flex flex-col">
          <button
            onClick={handleAddToCart}
            disabled={currentProduct.availableItems === 0}
            className="mb-3 flex w-full items-center justify-center space-x-2 rounded-full bg-primary py-3 px-4 text-on-primary shadow-card transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBagIcon className="w-5 h-5" />
            <span>
              {currentProduct.availableItems === 0 ? "Sold Out" : "Add to Cart"}
            </span>
          </button>

          <button
            onClick={handleBuyNow}
            disabled={currentProduct.availableItems === 0}
            className="flex w-full items-center justify-center space-x-2 rounded-full border border-hairline bg-surface py-3 px-4 text-ink transition-colors duration-200 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
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
