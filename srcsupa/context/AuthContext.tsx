import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../utils/api";

type User = {
  id: string;
  user_id: string;
  user_code: string;
  name: string;
  segment?: string;
  photoUrl?: string;
  branch_id?: string | null;
  branch_name?: string | null;
};

type LoginPayload = {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

type AuthContextType = {
  user: User | null;
  login: (data: LoginPayload) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // 🔎 cek token di awal
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const res = await api.get("/auth/me");
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error("Auth check gagal:", err);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = ({ user, accessToken, refreshToken, expiresIn }: LoginPayload) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("expiresIn", expiresIn.toString());
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiresIn");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
