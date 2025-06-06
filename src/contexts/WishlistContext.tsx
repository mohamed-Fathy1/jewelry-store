"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { wishlistService } from "@/services/wishlist.service";
import toast from "react-hot-toast";

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const fetchWishlist = async () => {
    try {
      const result = await wishlistService.getUserWishlist();
      if (result.success) {
        const productIds = result.data.wishlist.map(
          (item) => item.productId._id
        );
        setWishlist(productIds);
      } else {
        console.error("Failed to fetch wishlist:", result.message);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      // toast.error("Failed to fetch wishlist");
    }
  };

  const removeFromWishlist = async (id: string) => {
    setWishlist((prev) => {
      console.log(prev);
      return prev.filter((_id) => _id !== id);
    });
  };

  const toggleWishlist = async (productId: string) => {
    try {
      if (wishlist.includes(productId)) {
        removeFromWishlist(productId);
        await wishlistService.deleteFavoriteProduct(productId);
        toast.success("Item removed from wishlist");
      } else {
        setWishlist((prev) => [...prev, productId]);
        await wishlistService.addFavoriteProduct(productId);
        toast.success("Item added to wishlist");
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      // toast.error("Failed to update wishlist");
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
