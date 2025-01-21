interface Media {
  mediaUrl: string;
  mediaId: string;
}

export interface Category {
  _id: string;
  categoryName: string;
  slug: string;
  image: Media;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  statusCode: number;
  data: {
    categories: Category[];
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
