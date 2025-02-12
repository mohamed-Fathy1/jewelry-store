interface Media {
  mediaUrl: string;
  mediaId: string;
  _id?: string;
  id?: string;
}

export interface Category {
  _id: string;
  categoryName: string;
  slug: string;
  image: Media;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoriesResponse {
  statusCode: number;
  data: {
    categories: Category[];
    total?: number;
    perPage?: number;
  };
  message: string;
  success: boolean;
}

export interface CategoryResponse {
  statusCode: number;
  data: {
    category: Category;
  };
  message: string;
  success: boolean;
}

export interface CreateCategoryDto {
  categoryName: string;
  image: string;
}

export interface UpdateCategoryDto extends CreateCategoryDto {
  _id: string;
}
