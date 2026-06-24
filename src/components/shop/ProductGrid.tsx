"use client";

import Link from "next/link";
import { Product } from "@/types";
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { cn } from "@/lib/cn";
import SmartImage from "@/components/ui/SmartImage";
import { useWishlist } from "@/contexts/WishlistContext";

// This would typically come from an API
const products: Product[] = [
  {
    id: "1",
    name: "Diamond Pendant Necklace",
    description: "Elegant diamond pendant in 18k gold",
    price: 999.99,
    images: ["/images/IMG_2953.JPG"],
    category: "Necklaces",
    material: "Gold",
    rating: 4.5,
    reviews: 12,
    inStock: true,
  },
  {
    id: "2",
    name: "Sapphire Ring",
    description: "Beautiful sapphire ring with diamond accents",
    price: 1499.99,
    images: ["/images/IMG_1853.JPG"],
    category: "Rings",
    material: "Platinum",
    rating: 4.8,
    reviews: 8,
    inStock: true,
  },
  // Add more products...
];

export default function ProductGrid() {
  const { wishlist, toggleWishlist } = useWishlist();

  const addToCart = (productName: string) => {
    toast.success(`${productName} added to cart`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="group relative">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-muted">
            <SmartImage
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-4 right-4 space-y-2">
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label={
                  wishlist.includes(product.id)
                    ? `Remove ${product.name} from wishlist`
                    : `Add ${product.name} to wishlist`
                }
                aria-pressed={wishlist.includes(product.id)}
                className="grid h-9 w-9 place-items-center rounded-full bg-surface shadow-card transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <HeartIcon
                  className={cn(
                    "h-5 w-5",
                    wishlist.includes(product.id)
                      ? "fill-primary text-primary"
                      : "text-ink-muted"
                  )}
                />
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Link href={`/product/${product.id}`}>
              <h3 className="text-lg font-medium text-ink transition-colors group-hover:text-heading">
                {product.name}
              </h3>
            </Link>
            <p className="text-ink-muted">{product.category}</p>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold tabular-nums text-heading">
                EGP {product.price.toLocaleString()}
              </p>
              <button
                aria-label={`Add ${product.name} to cart`}
                className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-surface text-ink transition-all duration-200 hover:bg-primary hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() => addToCart(product.name)}
              >
                <ShoppingBagIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
