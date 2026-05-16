import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null = checking, false = logged out, object = logged in
  const [bootstrapping, setBootstrapping] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (_) {
      setUser(false);
    } finally {
      setBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data?.token) {
      try {
        window.localStorage.setItem("vx_token", data.token);
      } catch (_) {}
    }
    setUser({ id: data.id, email: data.email, name: data.name });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    try {
      window.localStorage.removeItem("vx_token");
    } catch (_) {}
    setUser(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, bootstrapping, login, logout, refresh: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
