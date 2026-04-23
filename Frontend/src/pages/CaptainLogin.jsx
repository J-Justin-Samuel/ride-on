import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import CaptainLogo from "/images/CaptainLogo.png";
import axios from "axios";
import { CaptainDataContext } from "../context/CaptainContext.jsx";

const CaptainLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setCaptain } = useContext(CaptainDataContext);
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 80);
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/login`,
        { email, password },
      );

      if (response.status === 200) {
        const data = response.data;
        setCaptain(data.captain);
        localStorage.setItem("captainToken", data.token);
        navigate("/captain-home");
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error("Captain login error:", err.response?.data);
    } finally {
      setLoading(false);
    }
    setEmail("");
    setPassword("");
  };

  return (
    <div className="h-screen overflow-hidden bg-[#023341] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm mb-3 flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3" fill="white" />
            <path
              d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">
          RideOn
        </span>
      </div>

      {/* Login Card */}
      <div
        ref={cardRef}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{
          opacity: 0,
          transform: "translateY(24px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div className="h-1 w-full bg-[#023341]" />

        <div className="px-8 py-5">
          {/* Logo + heading */}
          <div className="flex flex-col items-center mb-4">
            <img src={CaptainLogo} alt="RideOn" className="w-16 mb-2" />
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">
              Sign in to continue riding
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 rounded-xl px-4 py-2.5 text-xs font-medium text-red-700 bg-red-50 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={submitHandler} className="flex flex-col gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Email address
              </label>
              <input
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="captain@email.com"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#ff5900] focus:bg-white transition placeholder:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#ff5900] focus:bg-white transition placeholder:text-gray-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-between rounded-xl px-6 py-3 font-bold text-sm text-white transition-all duration-200 active:scale-[0.97] mt-1 disabled:opacity-60"
              style={{ backgroundColor: "#023341" }}
            >
              <span>{loading ? "Signing in..." : "Sign in"}</span>
              {!loading && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              New here?{" "}
              <Link
                to="/captain-signup"
                className="text-[#023341] font-semibold hover:underline"
              >
                Create captain account
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Switch to User */}
      <div className="w-full max-w-sm mt-3">
        <Link
          to="/login"
          className="group w-full flex items-center justify-between rounded-2xl px-6 py-3.5 font-bold text-sm text-white transition-all duration-200 active:scale-[0.97]"
          style={{ backgroundColor: "#ff5900" }}
        >
          <span>Sign in as User</span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CaptainLogin;
