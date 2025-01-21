interface Media {
  mediaUrl: string;
  mediaId: string;
  _id?: string;
  id?: string;
}

interface Category {
  image: Media;
  categoryName: string;
  slug: string;
}

export interface Product {
  _id: string;
  productName: string;
  productDescription: string;
  availableItems: number;
  price: number;
  salePrice: number;
  discount: number;
  discountPercentage: number;
  soldItems: number;
  isSoldOut: boolean;
  isSale: boolean;
  expiredSale: number;
  isExpiredSale: boolean;
  category: Category | string;
  createdBy: string;
  slug: string;
  defaultImage: Media;
  albumImages: Media[];
  createdAt: number;
  id: string;
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

export interface ProductsResponse {
  statusCode: number;
  data: {
    products: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      data: Product[];
    };
  };
  message: string;
  success: boolean;
}

export interface SingleProductResponse {
  statusCode: number;
  data: {
    product: Product;
  };
  message: string;
  success: boolean;
}
