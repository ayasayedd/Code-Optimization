import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiGetUser,
  type User,
} from "@/lib/api";
import { clearChatStorage } from "@/hooks/useChatManager";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    apiGetUser()
      .then((u) => {
        setUser(u);
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
        clearChatStorage();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    const res = await apiLogin(email, password);
    localStorage.setItem("token", res.token);
    setUser(res.user);
    setIsAuthenticated(true);
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    const res = await apiRegister(
      data.name,
      data.email,
      data.password,
      data.password_confirmation
    );
    localStorage.setItem("token", res.token);
    setUser(res.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await apiLogout().catch(() => {});
    localStorage.removeItem("token");
    clearChatStorage();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
