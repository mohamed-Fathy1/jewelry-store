"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { AuthContextType, User, AuthResponse } from "@/types/auth.types";
import { authService } from "@/services/auth.service";
import LoadingSpinner from "../components/LoadingSpinner"; // Import the new loading component
import axios, { AxiosError } from "axios";
import api from "@/lib/axios";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isloaded, setIsloaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const registerEmail = useCallback(
    async (email: string): Promise<AuthResponse> => {
      // setIsLoading(true);
      try {
        const response = await authService.registerEmail(email);
        if (response.success) {
          const userData = { email, id: response.data.id };
          setAuthUser(userData);
          try {
            localStorage.setItem("authUser", JSON.stringify(userData));
          } catch (error) {
            console.error("Failed to store user data:", error);
          }
        }
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const activateAccount = useCallback(
    async (email: string, activeCode: string): Promise<AuthResponse> => {
      // setIsLoading(true);
      try {
        const response = await authService.activateAccount(email, activeCode);
        if (response.success && response.data.accessToken) {
          const userData = {
            email,
            accessToken: response.data.accessToken,
          };
          setAuthUser(userData);
          try {
            localStorage.setItem("authUser", JSON.stringify(userData));
            localStorage.setItem("accessToken", response.data.accessToken);
          } catch (error) {
            console.error("Failed to store user data:", error);
          }
        }
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      router.push("/");
    } finally {
      setAuthUser(null);
      localStorage.removeItem("authUser");
      localStorage.removeItem("accessToken");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    authService.setupInterceptors(logout);

    const storedUser = localStorage.getItem("authUser");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAuthUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        // Clear invalid data from localStorage
        localStorage.removeItem("authUser");
        localStorage.removeItem("accessToken");
      }
    }
    setIsLoading(false);
  }, [logout]);

  const refreshToken = useCallback(async (): Promise<AuthResponse> => {
    // setIsLoading(true);
    try {
      const response = await authService.refreshToken();
      if (response.success && response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
        setAuthUser((prev) =>
          prev ? { ...prev, accessToken: response.data.accessToken } : null
        );
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // List of paths that require authentication
    const protectedPaths = [
      "/checkout",
      "/account",
      // Add other protected paths here
    ];
    const storedUser = localStorage.getItem("authUser");
    const storedToken = localStorage.getItem("accessToken");

    // Check if current path requires authentication
    const requiresAuth = protectedPaths.some((path) =>
      pathname.startsWith(path)
    );

    if (
      requiresAuth &&
      !storedUser &&
      (!storedToken || !authUser?.accessToken)
    ) {
      // Redirect to login if trying to access protected route while not authenticated
      router.push("/auth/login");
    }
  }, [pathname, authUser, router]);

  useEffect(() => {
    // Setup request interceptor to check auth
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        // Get the current URL path
        const path = config.url || "";

        // List of paths that don't require authentication
        const publicPaths = [
          "/authentication/register-email",
          "/authentication/active-account",
          "/authentication/refresh-token",
          // Add other public paths here
        ];

        // Check if the path requires authentication
        const requiresAuth = !publicPaths.some((publicPath) =>
          path.includes(publicPath)
        );

        if (requiresAuth && !authUser?.accessToken) {
          // Redirect to login if trying to make authenticated request while not logged in
          return false; // Cancel the request
        }

        // Add auth token to header if it exists
        if (authUser?.accessToken) {
          config.headers.Authorization = `Bearer ${authUser.accessToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await logout();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [authUser, logout, router]);

  useEffect(() => {
    // Move any initialization logic here
    const initAuth = async () => {
      // Your auth initialization code
      setIsLoading(false);
    };

    initAuth();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />; // Updated loading return
  }

  const value = {
    authUser,
    isAuthenticated: !!authUser?.accessToken,
    isLoading,
    registerEmail,
    activateAccount,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
