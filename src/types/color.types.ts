export interface Color {
  _id: string;
  name: string;
  hex: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateColorDto {
  name: string;
  hex: string;
}

export type UpdateColorDto = Partial<CreateColorDto>;

export interface ColorResponse {
  statusCode: number;
  data: {
    color?: Color;
  };
  message: string;
}

export interface ColorsResponse {
  statusCode: number;
  data: {
    data: Color[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
  message?: string;
}

export interface ColorsQuery {
  page?: number;
  search?: string;
}
