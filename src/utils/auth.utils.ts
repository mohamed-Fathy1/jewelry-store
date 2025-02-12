import jwt from "jsonwebtoken";
import { User } from "@/types/user.types";

interface DecodedToken {
  email: string;
  role?: string;
  exp: number;
  iat: number;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwt.decode(token) as DecodedToken;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const isAdmin = (user: User | null): boolean => {
  if (!user?.accessToken) return false;

  const decoded = decodeToken(user.accessToken);
  return decoded?.role === "admin";
};

export const isAuthorizedRole = (
  user: User | null,
  allowedRoles: string[]
): boolean => {
  if (!user?.accessToken) return false;

  const decoded = decodeToken(user.accessToken);
  return decoded?.role ? allowedRoles.includes(decoded.role) : false;
};

export const checkTokenExpiration = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return false;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp > currentTime;
};
