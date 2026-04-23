import React, { useContext, useEffect, useState } from "react";
import { CaptainDataContext } from "../context/CaptainContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CaptainProtectWrapper({ children }) {
  const token = localStorage.getItem("captainToken");
  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/captain-login");
      return;
    }
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.status === 200) {
          setCaptain(res.data.captain ?? res.data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        localStorage.removeItem("captainToken");
        navigate("/captain-login");
      });
  }, [token]);

  if (isLoading) {
    return (
      <div className="h-screen overflow-hidden bg-[#023341] flex flex-col items-center justify-center px-4">
        {/* Top wordmark — matches UserSignup */}
        <div className="w-full max-w-sm mb-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            RideOn Captain
          </span>
        </div>

        {/* Card — matches UserSignup card structure */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 w-full bg-[#ff5900]" />

          <div className="px-8 py-10 flex flex-col items-center">
            {/* Spinner */}
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-gray-100" />
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ff5900]"
                style={{ animation: "spin 0.9s linear infinite" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#023341">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
              </div>
            </div>

            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight mb-1">
              Verifying session
            </h1>
            <p className="text-gray-400 text-xs mb-6">
              Checking your captain credentials…
            </p>

            {/* Animated dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#ff5900]"
                  style={{
                    animation: "bounce 1s ease-in-out infinite",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="text-white/30 text-xs text-center mt-4 max-w-xs">
          You'll be redirected automatically once verified.
        </p>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); opacity: 0.4; }
            50% { transform: translateY(-5px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
