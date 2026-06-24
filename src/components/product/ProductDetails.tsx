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
import {
  ProductVariant,
  VariantColor,
  VariantSize,
} from "@/types/product.types";

// Variants arrive populated from the public endpoint, but stay defensive in case
// an id string slips through.
const getColor = (v: ProductVariant): VariantColor | null =>
  v.color && typeof v.color === "object" ? (v.color as VariantColor) : null;
const getSize = (v: ProductVariant): VariantSize | null =>
  v.size && typeof v.size === "object" ? (v.size as VariantSize) : null;

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
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);

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

  // ─── Variants ──────────────────────────────────────────────────────────────
  // Every product has at least one variant. A "simple" product is a single
  // variant with neither color nor size, so the dimensions are derived: we only
  // show the color/size pickers for the dimensions that actually exist.
  const variants: ProductVariant[] = currentProduct?.variants ?? [];
  const hasColors = variants.some((v) => getColor(v));
  const hasSizes = variants.some((v) => getSize(v));
  const needsSelection = hasColors || hasSizes;

  // Unique colors across all variants (preserve first-seen order).
  const colorOptions: VariantColor[] = [];
  const seenColors = new Set<string>();
  variants.forEach((v) => {
    const c = getColor(v);
    if (c && !seenColors.has(c._id)) {
      seenColors.add(c._id);
      colorOptions.push(c);
    }
  });

  // Sizes to show: scoped to the selected color when colors exist, otherwise
  // (size-only product) every size. Ordered by `order`.
  const sizeOptions: { size: VariantSize; availableItems: number }[] = [];
  if (hasSizes && (!hasColors || selectedColorId)) {
    const seenSizes = new Set<string>();
    variants.forEach((v) => {
      const c = getColor(v);
      const s = getSize(v);
      if (!s) return;
      if (hasColors && c?._id !== selectedColorId) return;
      if (seenSizes.has(s._id)) return;
      seenSizes.add(s._id);
      sizeOptions.push({ size: s, availableItems: v.availableItems });
    });
    sizeOptions.sort((a, b) => a.size.order - b.size.order);
  }

  // The variant matching the current selection, ignoring dimensions that don't
  // exist. A simple product (no dimensions) resolves to its single variant.
  const matchedVariant = variants.find((v) => {
    const colorOk = !hasColors || getColor(v)?._id === selectedColorId;
    const sizeOk = !hasSizes || getSize(v)?._id === selectedSizeId;
    return colorOk && sizeOk;
  });

  // Effective stock the buy controls should respect.
  const effectiveAvailable = matchedVariant?.availableItems ?? 0;
  const selectionComplete = Boolean(matchedVariant);
  const canPurchase = selectionComplete && effectiveAvailable > 0;
  // Whole product is unbuyable when nothing is in stock at all.
  const productSoldOut = variants.every((v) => v.availableItems <= 0);
  // e.g. "color and size", "color", or "size" — used in prompts.
  const optionsLabel = [hasColors && "color", hasSizes && "size"]
    .filter(Boolean)
    .join(" and ");

  const selectColor = (colorId: string) => {
    setSelectedColorId(colorId);
    setSelectedSizeId(null);
    setQuantity(1);
  };
  const selectSize = (sizeId: string) => {
    setSelectedSizeId(sizeId);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!currentProduct) return;
    if (needsSelection && !matchedVariant) {
      toast.error(`Please select a ${optionsLabel}`);
      return;
    }

    const matchedColor = matchedVariant ? getColor(matchedVariant) : null;
    const matchedSize = matchedVariant ? getSize(matchedVariant) : null;

    const cartItem: CartItem = {
      productId: currentProduct._id,
      quantity,
      price: currentProduct.salePrice || currentProduct.price,
      productName: currentProduct.productName,
      productImage: currentProduct.defaultImage.mediaUrl,
      availableItems: effectiveAvailable,
      ...(matchedVariant
        ? {
            variantId: matchedVariant._id,
            colorName: matchedColor?.name,
            colorHex: matchedColor?.hex,
            sizeNumber: matchedSize?.number,
          }
        : {}),
    };

    addToCart(cartItem);
  };

  const handleBuyNow = () => {
    if (!currentProduct) return;
    if (needsSelection && !matchedVariant) {
      toast.error(`Please select a ${optionsLabel}`);
      return;
    }

    const matchedColor = matchedVariant ? getColor(matchedVariant) : null;
    const matchedSize = matchedVariant ? getSize(matchedVariant) : null;

    const cartItem: CartItem = {
      productId: currentProduct._id,
      quantity,
      price: currentProduct.salePrice || currentProduct.price,
      productName: currentProduct.productName,
      productImage: currentProduct.defaultImage.mediaUrl,
      availableItems: effectiveAvailable,
      ...(matchedVariant
        ? {
            variantId: matchedVariant._id,
            colorName: matchedColor?.name,
            colorHex: matchedColor?.hex,
            sizeNumber: matchedSize?.number,
          }
        : {}),
    };

    addToCart(cartItem);
    router.push("/checkout");
  };

  const incrementQuantity = () => {
    if (quantity < effectiveAvailable) {
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
        <div className="relative aspect-[2.25/3] md:aspect-[4/3] rounded-lg overflow-hidden">
          <Image
            src={currentProduct.albumImages[activeImage].mediaUrl}
            alt={`${currentProduct.productName} - Main View`}
            width={1000}
            height={1000}
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={85}
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
                sizes="80px"
                quality={75}
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

        {/* Variant selectors */}
        {needsSelection && (
          <div className="space-y-4">
            {/* Colors */}
            {hasColors && (
              <div className="space-y-2">
                <span style={{ color: colors.textSecondary }}>
                  Color
                  {selectedColorId && (
                    <span
                      className="ml-1 font-medium"
                      style={{ color: colors.textPrimary }}
                    >
                      :{" "}
                      {
                        colorOptions.find((c) => c._id === selectedColorId)
                          ?.name
                      }
                    </span>
                  )}
                </span>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => {
                    const isSelected = color._id === selectedColorId;
                    return (
                      <button
                        key={color._id}
                        type="button"
                        onClick={() => selectColor(color._id)}
                        title={color.name}
                        aria-label={color.name}
                        aria-pressed={isSelected}
                        className="relative h-9 w-9 rounded-full border transition-transform duration-150 hover:scale-110"
                        style={{
                          backgroundColor: color.hex,
                          borderColor: isSelected
                            ? colors.brown
                            : colors.border,
                          boxShadow: isSelected
                            ? `0 0 0 2px ${colors.brown}`
                            : "none",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {hasSizes && (!hasColors || selectedColorId) && (
              <div className="space-y-2">
                <span style={{ color: colors.textSecondary }}>Size</span>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map(({ size, availableItems }) => {
                    const isSelected = size._id === selectedSizeId;
                    const isOut = availableItems <= 0;
                    return (
                      <button
                        key={size._id}
                        type="button"
                        disabled={isOut}
                        onClick={() => selectSize(size._id)}
                        aria-pressed={isSelected}
                        className="min-w-[2.75rem] px-3 py-2 rounded-md border text-sm transition-colors duration-150 disabled:opacity-40 disabled:line-through disabled:cursor-not-allowed"
                        style={{
                          borderColor: isSelected ? colors.brown : colors.border,
                          backgroundColor: isSelected
                            ? colors.brown
                            : colors.background,
                          color: isSelected
                            ? colors.textLight
                            : colors.textPrimary,
                        }}
                      >
                        {size.number}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

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
                  quantity >= effectiveAvailable
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
              disabled={quantity >= effectiveAvailable}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p style={{ color: colors.textSecondary }}>
            Availability:{" "}
            {needsSelection && !matchedVariant
              ? "Select a color and size"
              : effectiveAvailable > 0
              ? `${effectiveAvailable} in stock`
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

        {productSoldOut && (
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
            disabled={!canPurchase}
            className="w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors duration-200 disabled:opacity-50 mb-3"
            style={{ backgroundColor: colors.brown, color: colors.textLight }}
          >
            <ShoppingBagIcon className="w-5 h-5" />
            <span>
              {productSoldOut
                ? "Sold Out"
                : needsSelection && !matchedVariant
                ? "Select Options"
                : "Add to Cart"}
            </span>
          </button>

          <button
            onClick={handleBuyNow}
            disabled={!canPurchase}
            className="w-full py-3 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors duration-200 disabled:opacity-50"
            style={{
              backgroundColor: colors.background,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
            }}
          >
            <span>
              {productSoldOut
                ? "Sold Out"
                : needsSelection && !matchedVariant
                ? "Select Options"
                : "Buy Now"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
