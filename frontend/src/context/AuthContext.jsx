import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("redline_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("redline_token");
    if (!token) {
      setReady(true);
      return;
    }
    authService
      .me()
      .then((data) => {
        setUser(data);
        localStorage.setItem("redline_user", JSON.stringify(data));
      })
      .catch(() => {
        localStorage.removeItem("redline_token");
        localStorage.removeItem("redline_user");
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  function persist(authResponse) {
    localStorage.setItem("redline_token", authResponse.token);
    const userData = {
      userId: authResponse.userId,
      name: authResponse.name,
      email: authResponse.email,
      role: authResponse.role,
    };
    localStorage.setItem("redline_user", JSON.stringify(userData));
    setUser(userData);
  }

  async function login(payload) {
    const data = await authService.login(payload);
    persist(data);
    return data;
  }

  async function register(payload) {
    const data = await authService.register(payload);
    persist(data);
    return data;
  }

  function logout() {
    localStorage.removeItem("redline_token");
    localStorage.removeItem("redline_user");
    setUser(null);
  }

  function updateLocalUser(patch) {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("redline_user", JSON.stringify(next));
      return next;
    });
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
