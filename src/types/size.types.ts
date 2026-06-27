export interface Size {
  _id: string;
  number: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSizeDto {
  number: string;
  order: number;
}

export type UpdateSizeDto = Partial<CreateSizeDto>;

export interface SizeResponse {
  statusCode: number;
  data: {
    size?: Size;
  };
  message: string;
}

export interface SizesResponse {
  statusCode: number;
  data: {
    data: Size[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
  message?: string;
}

export interface SizesQuery {
  page?: number;
  limit?: number;
}
