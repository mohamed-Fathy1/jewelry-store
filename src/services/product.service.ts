import axios from "axios";
import {
  Product,
  ProductsResponse,
  SingleProductResponse,
} from "@/types/product.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({ baseURL: API_URL });

export const priceRange = {
  priceUnder100: "Under $100",
  priceBetween100and500: "$100 - $500",
  priceBetween500and1000: "$500 - $1000",
  priceAbove1000: "Above $1000",
} as const;

export const sort = {
  newest: "Newest",
  priceLowToHigh: "Low to High",
  priceHighToLow: "High to Low",
} as const;

// ── helpers ─────────────────────────────────────────────────────────────────
// Backend GET /products accepts: category, isBestSeller, isSale, minPrice,
// maxPrice, color, size, sort, page, limit. sort: "price" (asc) | "soldItems"
// | (default) createdAt desc. Map the storefront's filter labels onto that.
function mapSort(label?: string): string | undefined {
  if (!label) return undefined;
  if (label === sort.priceLowToHigh || label === "priceLowToHigh" || label === "price")
    return "price";
  if (label === sort.priceHighToLow || label === "priceHighToLow") return "price"; // backend has no price-desc
  if (label === "soldItems") return "soldItems";
  return undefined; // Newest → default (createdAt desc)
}

function mapPrice(range?: string): { minPrice?: number; maxPrice?: number } {
  switch (range) {
    case priceRange.priceUnder100:
      return { maxPrice: 100 };
    case priceRange.priceBetween100and500:
      return { minPrice: 100, maxPrice: 500 };
    case priceRange.priceBetween500and1000:
      return { minPrice: 500, maxPrice: 1000 };
    case priceRange.priceAbove1000:
      return { minPrice: 1000 };
    default:
      return {};
  }
}

function buildQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
  });
  return qs.toString();
}

// New endpoint returns { data: { products: Product[], pagination } }.
// Adapt to the legacy shape the contexts/pages read: data.products.{data,totalPages,currentPage}.
function adaptList(raw: any): ProductsResponse {
  const p = raw?.data?.products;
  const arr: Product[] = Array.isArray(p) ? p : p?.data ?? [];
  const pg = raw?.data?.pagination ?? {};
  return {
    success: raw?.success ?? true,
    message: raw?.message ?? "",
    data: {
      products: {
        data: arr,
        totalPages: pg.totalPages ?? 1,
        currentPage: pg.page ?? 1,
      },
    },
  };
}

async function fetchProducts(query: string): Promise<ProductsResponse> {
  const res = await axiosInstance.get(`/products?${query}`);
  return adaptList(res.data);
}

type Filters = {
  priceRange?: (typeof priceRange)[keyof typeof priceRange] | string;
  sort?: (typeof sort)[keyof typeof sort] | string;
};

export const productService = {
  // Raw new-shape listing (used by sections that read data.products directly).
  async getProductsList(
    params: { page?: number; limit?: number; sort?: string; category?: string; isSale?: boolean } = {}
  ): Promise<{ data: { products: Product[]; pagination?: any } }> {
    const query = buildQuery({
      page: params.page,
      limit: params.limit,
      sort: params.sort,
      category: params.category,
      isSale: params.isSale,
    });
    const response = await axiosInstance.get(`/products?${query}`);
    return response.data;
  },

  async getAllProducts(page: number = 1): Promise<ProductsResponse> {
    return fetchProducts(buildQuery({ page, limit: 20 }));
  },

  async getAllSaleProducts(page: number = 1): Promise<ProductsResponse> {
    return fetchProducts(buildQuery({ isSale: true, page, limit: 20 }));
  },

  // GET /products/:id → { data: { product, liked } }
  async getOneProduct(id: string, userId?: string): Promise<SingleProductResponse> {
    const q = userId ? `?user=${userId}` : "";
    const response = await axiosInstance.get<SingleProductResponse>(
      `/products/${id}${q}`
    );
    return response.data;
  },

  async getProductsByCategoryId(
    categoryId: string,
    page: number = 1,
    filters: Filters = {}
  ): Promise<ProductsResponse> {
    return fetchProducts(
      buildQuery({
        category: categoryId,
        page,
        limit: 20,
        sort: mapSort(filters.sort),
        ...mapPrice(filters.priceRange),
      })
    );
  },

  async getProductsByCategory(
    categoryId: string,
    page: number = 1
  ): Promise<ProductsResponse> {
    return fetchProducts(buildQuery({ category: categoryId, page, limit: 20 }));
  },

  async getSortedProducts(
    sortBy: string = "createdAt",
    _sortOrder: "asc" | "desc" = "desc",
    page: number = 1
  ): Promise<ProductsResponse> {
    return fetchProducts(buildQuery({ sort: mapSort(sortBy), page, limit: 20 }));
  },

  // GET /products/search?searchQuery= → { data: { products: Product[] } }
  async searchProducts(query: string): Promise<ProductsResponse> {
    const res = await axiosInstance.get(
      `/products/search?searchQuery=${encodeURIComponent(query)}`
    );
    return adaptList(res.data);
  },

  async getFilteredProducts(
    filters: Filters = {},
    page: number = 1
  ): Promise<ProductsResponse> {
    return fetchProducts(
      buildQuery({
        page,
        limit: 20,
        sort: mapSort(filters.sort),
        ...mapPrice(filters.priceRange),
      })
    );
  },

  // POST /products/available-items → live stock for a set of products/variants
  async getProductsAndAvailableItems(payload: unknown): Promise<any> {
    const res = await axiosInstance.post(`/products/available-items`, payload);
    return res.data;
  },
};
