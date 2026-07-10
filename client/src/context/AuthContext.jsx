import { createContext, useContext, useState, useCallback } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("ledger_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("ledger_token"));

  const persist = (nextToken, nextUser) => {
    localStorage.setItem("ledger_token", nextToken);
    localStorage.setItem("ledger_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = useCallback(async (username, password) => {
    const { data } = await client.post("/auth/login", { username, password });
    persist(data.token, data.user);
  }, []);

  const register = useCallback(async (username, password) => {
    const { data } = await client.post("/auth/register", { username, password });
    persist(data.token, data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ledger_token");
    localStorage.removeItem("ledger_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
