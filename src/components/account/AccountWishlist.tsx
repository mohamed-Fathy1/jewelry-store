"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SmartImage from "@/components/ui/SmartImage";
import Link from "next/link";
import { TrashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { wishlistService } from "@/services/wishlist.service";
import { useWishlist } from "@/contexts/WishlistContext";
import Pagination from "@/components/common/Pagination";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/utils/format";
import { Product } from "@/types/product.types";
import { CartItem } from "@/types/cart.types";
import { WishlistItem } from "@/types/wishlist.types";
import { analytics } from "@/lib";

export default function AccountWishlist() {
  const { toggleWishlist } = useWishlist();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();
  // const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const result = await wishlistService.getUserWishlist(currentPage);
        if (result.success) {
          // /wishlist/get-user-wishlist returns `data.wishlist` as a flat array;
          // tolerate the paginated `{ products }` shape, and fall back to [] so
          // the empty state renders instead of crashing on `wishlist.length`.
          const w = result.data?.wishlist;
          setWishlist(Array.isArray(w) ? w : w?.products ?? []);
        } else {
          console.error("Failed to fetch wishlist:", result.message);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [currentPage]);

  const removeFromWishlist = async (id: string) => {
    setWishlist((prev) => {
      return prev.filter((item) => item.productId._id !== id);
    });
  };

  const handleAddToCart = (product: Product) => {
    // Only add directly when we can resolve a concrete variant (a "simple"
    // product: one variant, no colour/size). Variant products — or payloads
    // without variant data — would otherwise become an invalid variant-less
    // line that fails at checkout, so route to the product page to choose.
    const variants = product.variants ?? [];
    const simpleVariant =
      variants.length === 1 && !variants[0].color && !variants[0].size
        ? variants[0]
        : null;

    if (!simpleVariant) {
      router.push(`/product/${product._id}`);
      return;
    }
    if (simpleVariant.availableItems <= 0) return;

    const price = product.salePrice || product.price;
    addToCart({
      productId: product._id,
      variantId: simpleVariant._id,
      quantity: 1,
      price,
      productName: product.productName,
      productImage: product.defaultImage.mediaUrl,
      availableItems: simpleVariant.availableItems,
    } as CartItem);
    analytics.trackAddToCart({
      id: product._id,
      name: product.productName,
      price,
      quantity: 1,
    });
  };

  if (loading) {
    return <div>Loading wishlist...</div>;
  }

  if (!wishlist?.length) {
    return (
      <div className="text-center py-12">
        <h2 className="font-display text-lg text-heading">
          Your Wishlist is Empty
        </h2>
        <p className="mt-2 text-ink-muted">
          You have not added any items to your wishlist yet.
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-on-primary shadow-card transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div
            key={item._id}
            className="flex flex-col rounded-2xl overflow-hidden bg-surface-muted"
          >
            <div className="aspect-square relative">
              <SmartImage
                src={item.productId.defaultImage.mediaUrl}
                alt={item.productId.productName}
                fill
                className="object-cover"
              />
              {item.productId.isSoldOut && (
                <div className="absolute inset-0 flex items-center justify-center bg-noir/50">
                  <span className="px-4 py-2 rounded-md text-sm font-medium text-on-primary">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              {/* flex-1 lets the title absorb slack so the price + Add-to-Cart
                  row drops to a shared bottom across cards of varying title
                  length. */}
              <Link href={`/product/${item.productId._id}`} className="flex-1">
                <h3 className="font-display text-lg text-heading mb-1">
                  {item.productId.productName}
                </h3>
              </Link>
              <p className="mt-2 text-lg font-semibold mb-4 text-heading tabular-nums">
                {formatPrice(item.productId.price)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(item.productId)}
                  disabled={item.productId.isSoldOut}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-primary py-2 text-sm font-medium text-on-primary shadow-card transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    removeFromWishlist(item.productId._id);
                    toggleWishlist(item.productId._id);
                  }}
                  aria-label={`Remove ${item.productId.productName} from wishlist`}
                  className="p-2 rounded-full border border-hairline text-ink transition-colors duration-200 hover:border-hairline-strong hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="mt-4"
      />
    </div>
  );
}
