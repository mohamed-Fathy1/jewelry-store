export interface Media {
  mediaUrl: string;
  mediaId: string;
  _id?: string;
  id?: string;
}

export interface ProductCategory {
  _id: string;
  categoryName: string;
  slug?: string;
}

export interface Product {
  _id: string;
  productName: string;
  productDescription?: string;
  slug?: string;
  price: number;
  salePrice?: number;
  finalPrice?: number;
  discount?: number;
  discountPercentage?: number;
  isSale?: boolean;
  isBestSeller?: boolean;
  isSoldOut?: boolean;
  /** Stock count. Absent on aggregated /home payloads, so treat `undefined` as in-stock. */
  availableItems?: number;
  expiredSale?: number | string;
  category?: ProductCategory;
  defaultImage: Media;
  albumImages?: Media[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: {
    product?: Product;
    products?: Product[];
    total?: number;
    perPage?: number;
  };
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: {
    products: {
      data: Product[];
      totalPages: number;
      currentPage: number;
    };
  };
}

export interface SingleProductResponse {
  statusCode: number;
  data: {
    product: Product;
  };
  message: string;
  success: boolean;
}

export interface CreateProductDto {
  productName: string;
  productDescription: string;
  price: number;
  availableItems: number;
  salePrice?: number;
  expiredSale?: string;
  categoryId: string;
  defaultImage: string;
  albumImages: string[];
}
