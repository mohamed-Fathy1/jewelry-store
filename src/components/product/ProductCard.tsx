"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import SmartImage from "@/components/ui/SmartImage";
import { Product } from "@/types/product.types";
import { useCart } from "@/contexts/CartContext";
import { CartItem } from "@/types/cart.types";
import { useWishlist } from "@/contexts/WishlistContext";
import Badge from "@/components/ui/Badge";

interface ProductCardProps {
  product: Product;
  /** Preload the image for above-the-fold cards. */
  priority?: boolean;
  /** Responsive sizes hint for next/image. */
  sizes?: string;
  /** Optional accent badge. */
  badge?: "bestseller" | "sale" | null;
  /** Light text treatment for placement on a dark surface (e.g. flash sale). */
  onDark?: boolean;
}

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-2xl bg-surface-sunken" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-1/3 rounded bg-surface-sunken" />
        <div className="h-4 w-3/4 rounded bg-surface-sunken" />
        <div className="h-4 w-1/4 rounded bg-surface-sunken" />
      </div>
    </div>
  );
}

function ProductCard({
  product,
  priority = false,
  sizes,
  badge = null,
  onDark = false,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const reduceMotion = useReducedMotion();

  // /home payloads omit availableItems → treat undefined as in-stock.
  const inStock =
    product.availableItems === undefined || product.availableItems > 0;
  const liked = wishlist.includes(product._id);
  const hasDiscount = (product.discountPercentage ?? 0) > 0;
  const onSale = !!product.salePrice && product.salePrice > 0;
  const displayPrice = onSale ? product.salePrice! : product.price;
  const showStrike = onSale && product.salePrice! < product.price;
  const categoryName =
    typeof product.category === "object" ? product.category?.categoryName : "";
  const href = `/product/${product._id}`;

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart({
      productId: product._id,
      quantity: 1,
      price: displayPrice,
      productName: product.productName,
      productImage: product.defaultImage.mediaUrl,
      availableItems: product.availableItems ?? 99,
    } as CartItem);
  };

  return (
    <motion.div
      whileHover={reduceMotion || !inStock ? undefined : { y: -6 }}
      transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
      className="group relative"
    >
      {/* Single navigation target: media + text. */}
      <Link href={href} className="block focus:outline-none">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-muted shadow-soft ring-1 ring-hairline/60 transition-shadow duration-300 group-hover:shadow-card-hover">
          <SmartImage
            src={product.defaultImage.mediaUrl}
            alt={product.productName}
            fill
            sizes={
              sizes ??
              "(min-width:1280px) 22vw, (min-width:768px) 33vw, (min-width:640px) 50vw, 100vw"
            }
            priority={priority}
            className={cn(
              "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]",
              !inStock && "opacity-50"
            )}
          />
          {!inStock ? (
            <div className="absolute inset-0 grid place-items-center">
              <span className="rotate-[-8deg] rounded-md bg-ink/85 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-on-primary">
                Sold Out
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-4 space-y-1">
          {categoryName ? (
            <p
              className={cn(
                "text-[11px] font-medium uppercase tracking-[0.14em]",
                onDark ? "text-on-primary/55" : "text-ink-muted"
              )}
            >
              {categoryName}
            </p>
          ) : null}
          <h3
            className={cn(
              "line-clamp-1 text-[15px] font-medium transition-colors",
              onDark ? "text-on-primary" : "text-ink group-hover:text-heading"
            )}
          >
            {product.productName}
          </h3>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "text-[15px] font-semibold tabular-nums",
                onDark ? "text-on-primary" : "text-heading"
              )}
            >
              EGP {displayPrice.toLocaleString()}
            </span>
            {showStrike ? (
              <span
                className={cn(
                  "text-xs tabular-nums line-through",
                  onDark ? "text-on-primary/45" : "text-ink-muted"
                )}
              >
                EGP {product.price.toLocaleString()}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      {/* Overlay layer scoped to the IMAGE area only (top-aligned square).
          pointer-events-none lets clicks fall through to the link; the
          interactive controls re-enable pointer events on themselves. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 aspect-square">
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {hasDiscount ? (
            <Badge variant="discount">
              −{Math.round(product.discountPercentage!)}%
            </Badge>
          ) : null}
          {badge === "bestseller" ? (
            <Badge variant="bestseller">Best Seller</Badge>
          ) : null}
          {badge === "sale" && !hasDiscount ? (
            <Badge variant="sale">Sale</Badge>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product._id)}
          aria-label={
            liked
              ? `Remove ${product.productName} from wishlist`
              : `Add ${product.productName} to wishlist`
          }
          aria-pressed={liked}
          className="pointer-events-auto absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-surface/80 ring-1 ring-hairline/50 backdrop-blur transition-all hover:scale-110 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <HeartIcon
            className={cn(
              "h-[18px] w-[18px] transition-colors",
              liked ? "fill-primary text-primary" : "text-ink-muted"
            )}
          />
        </button>

        {inStock ? (
          <>
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={`Add ${product.productName} to cart`}
              style={{ touchAction: "manipulation" }}
              className="pointer-events-auto absolute inset-x-3 bottom-3 hidden translate-y-2 items-center justify-center gap-2 rounded-full bg-surface/95 py-2.5 text-sm font-semibold text-heading opacity-0 shadow-card-hover backdrop-blur transition-all duration-300 hover:bg-primary hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group-hover:translate-y-0 group-hover:opacity-100 md:flex"
            >
              <ShoppingBagIcon className="h-[18px] w-[18px]" />
              Add to Bag
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={`Add ${product.productName} to cart`}
              style={{ touchAction: "manipulation" }}
              className="pointer-events-auto absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-primary text-on-primary shadow-card-hover transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
            >
              <ShoppingBagIcon className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>
    </motion.div>
  );
}

ProductCard.Skeleton = ProductCardSkeleton;

export default ProductCard;
