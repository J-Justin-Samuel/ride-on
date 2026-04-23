import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

export const UserDataContext = createContext();

const UserContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Auto-restore session from token on app load ──────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // data.user should have _id, fullname, email
        setUser(data.user);
      } catch {
        localStorage.removeItem("userToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${BASE_URL}/users/login`, {
        email,
        password,
      });
      // Backend returns: { token, user: { _id, fullname, email } }
      localStorage.setItem("userToken", data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Signup ────────────────────────────────────────────────────────────────
  const signup = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${BASE_URL}/users/register`, formData);
      localStorage.setItem("userToken", data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    const token = localStorage.getItem("userToken");
    try {
      await axios.get(`${BASE_URL}/users/logout`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // ignore errors
    } finally {
      localStorage.removeItem("userToken");
      setUser(null);
    }
  };

  return (
    <UserDataContext.Provider
      value={{ user, setUser, loading, error, login, signup, logout }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export default UserContext;
