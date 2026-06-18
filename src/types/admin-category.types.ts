import { Icon } from "./icon.types";

export interface CategoryMedia {
  mediaUrl: string;
  mediaId: string;
  _id?: string;
}

// icon_id may come back as a populated icon object, a raw id string, or null.
export type CategoryIcon = Icon | string | null;

export interface AdminCategory {
  _id: string;
  categoryName: string;
  slug: string;
  image: CategoryMedia;
  icon_id?: CategoryIcon;
  isDeleted?: boolean;
  createdBy?: string;
  createdAt?: number;
}

export interface CategoriesResponse {
  statusCode: number;
  data: {
    categories: AdminCategory[];
    total?: number;
    perPage?: number;
  };
  message: string;
  success: boolean;
}

export interface CategoryResponse {
  statusCode: number;
  data: {
    category: AdminCategory;
  };
  message: string;
  success: boolean;
}

export interface HardDeleteResponse {
  statusCode: number;
  data: {
    deletedProducts: number;
    deletedVariants: number;
    deletedImages: number;
  };
  message: string;
  success: boolean;
}

export interface CreateCategoryDto {
  categoryName: string;
  imageUrl: string;
  icon_id?: string | null;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
