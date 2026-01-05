// contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import api from "../api/axios";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  age?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data from API using the access token
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await api.get("/auth/user");
      setUser(response.data.user || response.data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      localStorage.removeItem("access_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const refreshUser = async () => {
    setIsLoading(true);
    await fetchUserData();
  };

  const clearUser = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    refreshUser,
    clearUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
