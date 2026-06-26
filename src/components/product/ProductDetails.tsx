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
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import SmartImage from "@/components/ui/SmartImage";
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
  const reduceMotion = useReducedMotion();
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

  // Auto-rotate images every 3 seconds if autoPlay is true. Suppressed for
  // visitors who prefer reduced motion.
  useEffect(() => {
    // `currentProduct` is null until the async fetch resolves; without this
    // guard the interval could fire and dereference a null product (crash).
    if (!autoPlay || reduceMotion || !currentProduct?.albumImages?.length)
      return;

    sliderRef.current = setInterval(() => {
      setActiveImage((current) =>
        current === (currentProduct?.albumImages?.length ?? 1) - 1
          ? 0
          : current + 1
      );
    }, 3000);

    return () => {
      if (sliderRef.current) clearInterval(sliderRef.current);
    };
  }, [autoPlay, reduceMotion, currentProduct?.albumImages?.length]);

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

        {/* Variant selectors */}
        {needsSelection && (
          <div className="space-y-4">
            {/* Colors */}
            {hasColors && (
              <div className="space-y-2">
                <span className="text-ink-muted">
                  Color
                  {selectedColorId && (
                    <span className="ml-1 font-medium text-ink">
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
                        className={cn(
                          "relative h-9 w-9 rounded-full border transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                          isSelected
                            ? "border-primary ring-2 ring-primary ring-offset-1 ring-offset-surface"
                            : "border-hairline"
                        )}
                        style={{ backgroundColor: color.hex }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {hasSizes && (!hasColors || selectedColorId) && (
              <div className="space-y-2">
                <span className="text-ink-muted">Size</span>
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
                        className={cn(
                          "min-w-[2.75rem] px-3 py-2 rounded-md border text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 disabled:line-through disabled:cursor-not-allowed",
                          isSelected
                            ? "border-primary bg-primary text-on-primary"
                            : "border-hairline bg-surface text-ink hover:bg-surface-muted"
                        )}
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
                quantity >= effectiveAvailable ? "text-ink-muted" : "text-ink"
              )}
            >
              {quantity}
            </span>
            <button
              onClick={incrementQuantity}
              aria-label="Increase quantity"
              className="px-3 py-1 text-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              disabled={quantity >= effectiveAvailable}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-ink-muted">
            Availability:{" "}
            {needsSelection && !matchedVariant
              ? "Select a color and size"
              : effectiveAvailable > 0
              ? `${effectiveAvailable} in stock`
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

        {productSoldOut && (
          <div className="rounded-lg border border-hairline bg-surface-muted p-4 text-center">
            <p className="text-ink-muted">
              This product is currently sold out. Add it to your wishlist to be
              notified when it's back in stock!
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={handleAddToCart}
            disabled={!canPurchase}
            className="w-full gap-2"
          >
            <ShoppingBagIcon className="w-5 h-5" />
            <span>{productSoldOut ? "Sold Out" : "Add to Cart"}</span>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={handleBuyNow}
            disabled={!canPurchase}
            className="w-full gap-2"
          >
            <span>{productSoldOut ? "Sold Out" : "Buy Now"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
