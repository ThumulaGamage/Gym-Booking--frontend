import { createContext, useState, useEffect } from "react";
import API from "../api/api";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Run at app start
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    // Set token to all requests
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Validate token and get user
    API.get("/auth/me")
      .then(res => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
