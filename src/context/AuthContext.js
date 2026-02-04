import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Spinner from "../components/common/Spinner";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const storedUser = JSON.parse(sessionStorage.getItem("user"));
        if (storedUser) {
          setUser(storedUser);
        } else {
          sessionStorage.clear();
        }
      } catch (error) {
        sessionStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    // Use setTimeout to ensure state update completes before navigation
    setTimeout(() => {
      navigate(`/${data.user.role.toLowerCase()}`, { replace: true });
    }, 0);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
