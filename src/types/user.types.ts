export interface User {
  _id: string;
  email: string;
  role?: "user" | "admin" | "product_manager" | "order_manager";
  accessToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  statusCode: number;
  data: {
    user?: User;
    users?: User[];
  };
  message: string;
  success: boolean;
}

export interface UserContextType {
  user: User | null;
  isLoading: boolean;
  getProfile: () => Promise<UserResponse>;
  updateProfile: (data: Partial<User>) => Promise<UserResponse>;
}
