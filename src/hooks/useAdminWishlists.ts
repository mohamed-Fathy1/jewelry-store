import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { adminWishlistService } from "@/services/admin-wishlist.service";

// Centralized query keys so cache invalidation stays consistent.
export const adminWishlistKeys = {
  all: ["admin", "wishlists"] as const,
  list: (page: number) => [...adminWishlistKeys.all, "list", page] as const,
};

// Paginated list of all saved wishlist products (20/page, server-driven).
// keepPreviousData avoids a flicker while paging.
export function useAllWishlist(page: number) {
  return useQuery({
    queryKey: adminWishlistKeys.list(page),
    queryFn: () => adminWishlistService.getAllWishlist(page),
    placeholderData: keepPreviousData,
  });
}
