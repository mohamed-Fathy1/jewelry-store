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
  price: number;
  availableItems: number;
  salePrice?: number;
  expiredSale?: number | string;
  categoryId: string;
  defaultImage: string;
  albumImages: string[];
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
