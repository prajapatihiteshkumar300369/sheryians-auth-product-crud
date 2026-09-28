import { createContext, useContext, useEffect, useState } from "react";
import api, { refreshAccessToken, setAccessToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    setAccessToken(response.data.accessToken);
    setUser(response.data.user);
  }

  async function register(data) {
    return api.post("/auth/register", data);
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if the server call fails, clear the local session below.
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        await refreshAccessToken();
        const meResponse = await api.get("/auth/me");
        if (active) setUser(meResponse.data.user);
      } catch {
        setAccessToken(null);
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();

    const handleForcedLogout = () => {
      setAccessToken(null);
      setUser(null);
    };

    window.addEventListener("auth:logout", handleForcedLogout);

    return () => {
      active = false;
      window.removeEventListener("auth:logout", handleForcedLogout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
