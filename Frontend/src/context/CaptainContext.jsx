import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

export const CaptainDataContext = createContext();
export const useCaptain = () => useContext(CaptainDataContext);

const CaptainContext = ({ children }) => {
  const [captain, setCaptain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Auto-restore session from token on app load ──────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("captainToken");
    if (!token) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${BASE_URL}/captains/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // data.captain should match the shape below
        setCaptain(data.captain);
      } catch {
        localStorage.removeItem("captainToken");
        setCaptain(null);
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
      const { data } = await axios.post(`${BASE_URL}/captains/login`, {
        email,
        password,
      });

      // Backend should return: { token, captain: { _id, fullname, vehicle, rating, ... } }
      localStorage.setItem("captainToken", data.token);
      setCaptain(data.captain);
      return data.captain;
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
      const { data } = await axios.post(
        `${BASE_URL}/captains/register`,
        formData,
      );

      localStorage.setItem("captainToken", data.token);
      setCaptain(data.captain);
      return data.captain;
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
    const token = localStorage.getItem("captainToken");
    try {
      await axios.get(`${BASE_URL}/captains/logout`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // ignore logout errors
    } finally {
      localStorage.removeItem("captainToken");
      setCaptain(null);
    }
  };

  // ── Update earnings / stats locally after a ride ──────────────────────────
  const updateStats = ({ earned = 0, ridesCompleted = 0 }) => {
    setCaptain((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        earnings: (prev.earnings ?? 0) + earned,
        totalRides: (prev.totalRides ?? 0) + ridesCompleted,
      };
    });
  };

  return (
    <CaptainDataContext.Provider
      value={{
        captain,
        setCaptain,
        loading,
        error,
        login,
        signup,
        logout,
        updateStats,
      }}
    >
      {children}
    </CaptainDataContext.Provider>
  );
};

export default CaptainContext;
