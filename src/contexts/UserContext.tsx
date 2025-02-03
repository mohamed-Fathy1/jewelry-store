"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { UserContextType, User, UserResponse } from "@/types/user.types";
import { userService } from "@/services/user.service";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

export const UserContext = createContext<{
  user: User | null;
  getProfile: () => Promise<void>;
  defaultAddressId: string | null;
  setDefaultAddressId: (id: string | null) => void;
}>({
  user: null,
  getProfile: async () => {},
  defaultAddressId: null,
  setDefaultAddressId: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  const [defaultAddressId, setDefaultAddressId] = useState<string | null>(null);

  // Setup response interceptor for handling 401s
  React.useEffect(() => {
    userService.setupResponseInterceptor(logout);
  }, [logout]);

  useEffect(() => {
    // Initialize default address from localStorage
    const storedDefaultId = localStorage.getItem("defaultAddressId");
    setDefaultAddressId(storedDefaultId);
  }, []);

  const getProfile = useCallback(async (): Promise<UserResponse> => {
    setIsLoading(true);
    try {
      const response = await userService.getUserInformation();
      if (response.success && response.data.user) {
        // update local storage
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      // toast.error("Failed to fetch user profile");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const updateProfile = useCallback(
    async (data: Partial<User>): Promise<UserResponse> => {
      setIsLoading(true);
      try {
        const response = await userService.updateProfile(data);
        if (response.success && response.data.user) {
          setUser(response.data.user);
          toast.success("Profile updated successfully");
        }
        return response;
      } catch (error) {
        toast.error("Failed to update profile");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSetDefaultAddressId = (id: string | null) => {
    setDefaultAddressId(id);
    if (id) {
      localStorage.setItem("defaultAddressId", id);
    } else {
      localStorage.removeItem("defaultAddressId");
    }
  };

  const value = {
    user,
    isLoading,
    getProfile,
    updateProfile,
    defaultAddressId,
    setDefaultAddressId: handleSetDefaultAddressId,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
