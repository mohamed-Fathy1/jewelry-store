export interface AuthResponse {
  statusCode: number;
  data: {
    email?: string;
    id?: string;
    accessToken?: string;
    user?: {
      _id: string;
      email: string;
      role: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  message: string;
  success: boolean;
}

export interface User {
  email: string;
  id?: string;
  accessToken?: string;
}

export interface AuthContextType {
  authUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  registerEmail: (email: string) => Promise<AuthResponse>;
  activateAccount: (email: string, activeCode: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: (email: string) => Promise<AuthResponse>;
}
