import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import api from "../services/api.ts";
import { User, ValidationError } from "../types.ts";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string, role: "user" | "admin") => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Clear any existing errors
  const clearError = () => setError(null);

  // Initialize Auth state from localStorage and verify session with backend
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);

          // Verify session integrity with server
          const response = await api.get("/auth/profile");
          if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        } catch (err: any) {
          console.warn("Session validation failed. Clearing state.");
          handleReset();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for axios interceptor session expiration event
    const handleExpiredSession = () => {
      handleReset();
    };

    window.addEventListener("auth-session-expired", handleExpiredSession);
    return () => {
      window.removeEventListener("auth-session-expired", handleExpiredSession);
    };
  }, []);

  const handleReset = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  /**
   * Register Action
   */
  const register = async (
    name: string,
    email: string,
    password: string,
    role: "user" | "admin"
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      if (response.data.success) {
        const { token: receivedToken, user: receivedUser } = response.data;
        setUser(receivedUser);
        setToken(receivedToken);
        setIsAuthenticated(true);
        localStorage.setItem("token", receivedToken);
        localStorage.setItem("user", JSON.stringify(receivedUser));
      }
    } catch (err: any) {
      const apiError = err.response?.data?.error || "Registration failed. Please try again.";
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login Action
   */
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.success) {
        const { token: receivedToken, user: receivedUser } = response.data;
        setUser(receivedUser);
        setToken(receivedToken);
        setIsAuthenticated(true);
        localStorage.setItem("token", receivedToken);
        localStorage.setItem("user", JSON.stringify(receivedUser));
      }
    } catch (err: any) {
      const apiError = err.response?.data?.error || "Login failed. Invalid credentials.";
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout Action
   */
  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Backend logout clean up failed:", err);
    } finally {
      handleReset();
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
