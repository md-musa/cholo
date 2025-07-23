import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser, registerUser } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log(userData);
  useEffect(() => {
    const loadUserData = () => {
      try {
        const auth = localStorage.getItem("auth");

        if (auth) {
          const parsedAuth = JSON.parse(auth);

          setUserData({
            ...parsedAuth,
          });

          if (parsedAuth.accessToken) {
            navigate("/dashboard", { replace: true });
          }
        } else {
          setUserData(null);
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Error loading session:", err);
        toast.error("Failed to load your session.");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const registration = async (data) => {
    try {
      setLoading(true);
      const { data: result } = await registerUser(data);
      const { accessToken, user } = result.data;
      const { _id, name, email, role, routeId } = user;

      const authPayload = {
        userId: _id,
        accessToken,
        name,
        email,
        role,
      };

      localStorage.setItem("auth", JSON.stringify(authPayload));

      setUserData({ ...authPayload });

      toast.success(`Welcome ${name}!`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const login = async (data) => {
    try {
      setLoading(true);
      const { data: result } = await loginUser(data);
      const { accessToken, user } = result.data;
      const { _id, name, email, role, routeId } = user;

      const authPayload = {
        userId: _id,
        accessToken,
        name,
        email,
        role,
      };

      localStorage.setItem("auth", JSON.stringify(authPayload));

      setUserData({ ...authPayload });

      toast.success(`Welcome back, ${name}!`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("auth");
      setUserData(null);
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        isAuthenticated: !!userData?.accessToken,
        authLoading: loading,
        login,
        registration,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
