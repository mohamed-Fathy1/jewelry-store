export interface Icon {
  _id: string;
  key: string;
  svg: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIconDto {
  key: string;
  svg: string;
  isActive: boolean;
}

export type UpdateIconDto = Partial<CreateIconDto>;

export interface IconResponse {
  statusCode: number;
  data: {
    icon?: Icon;
  };
  message: string;
}

export interface IconsResponse {
  statusCode: number;
  data: {
    data: Icon[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
  message?: string;
}

export interface IconsQuery {
  page?: number;
}
