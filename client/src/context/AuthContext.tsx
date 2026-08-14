"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, LoginInput, RegisterInput, AuthResponseData } from "../types/api";
import { api, ApiError } from "../lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<AuthResponseData>;
  register: (credentials: RegisterInput) => Promise<AuthResponseData>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get<User>("/auth/me");
      if (response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      // Clear token ONLY on 401 Unauthorized errors
      if (err instanceof ApiError && err.statusCode === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: LoginInput): Promise<AuthResponseData> => {
    const response = await api.post<AuthResponseData>("/auth/login", credentials);
    if (response.data && response.data.accessToken) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.data.accessToken);
      }
      setUser(response.data.user);
      return response.data;
    }
    throw new ApiError("Authentication failed: invalid server response", 500);
  };

  const register = async (credentials: RegisterInput): Promise<AuthResponseData> => {
    const response = await api.post<AuthResponseData>("/auth/register", credentials);
    if (response.data && response.data.accessToken) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.data.accessToken);
      }
      setUser(response.data.user);
      return response.data;
    }
    throw new ApiError("Registration failed: invalid server response", 500);
  };

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
