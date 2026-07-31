import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import api from "../api/client";

const AuthContext = createContext(null);
const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setUser(null);
      localStorage.removeItem("nutrix_user");
    }, IDLE_TIMEOUT);
  }, []);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("nutrix_user", JSON.stringify(res.data.user));
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const onUnauthorized = () => {
      setUser(null);
      localStorage.removeItem("nutrix_user");
    };
    window.addEventListener("nutrix:unauthorized", onUnauthorized);
    return () => {
      window.removeEventListener("nutrix:unauthorized", onUnauthorized);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => events.forEach((e) => window.removeEventListener(e, resetTimer));
  }, [resetTimer, user]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
    localStorage.setItem("nutrix_user", JSON.stringify(data.user));
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post("/auth/logout"); } catch { /* noop */ }
    setUser(null);
    localStorage.removeItem("nutrix_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
