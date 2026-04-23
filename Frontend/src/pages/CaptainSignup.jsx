import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import CaptainLogo from "/images/CaptainLogo.png";
import { CaptainDataContext } from "../context/CaptainContext.jsx";
import axios from "axios";

const CaptainSignup = () => {
  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 = personal, 2 = vehicle

  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 80);
  }, []);

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/register`,
        {
          fullname: { firstname: firstName, lastname: lastName },
          email,
          password,
          vehicle: {
            color: vehicleColor,
            plate: vehiclePlate,
            capacity: Number(vehicleCapacity),
            vehicleType,
          },
        },
      );
      if (response.status === 201) {
        const data = response.data;
        setCaptain(data.captain);
        localStorage.setItem("captainToken", data.token);
        navigate("/captain-home");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#023341] focus:bg-white transition placeholder:text-gray-300";

  const labelCls =
    "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <div className="h-screen overflow-hidden bg-[#023341] flex flex-col items-center justify-center px-4 ">
      {/* Brand row */}
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

      {/* Card */}
      <div
        ref={cardRef}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{
          opacity: 0,
          transform: "translateY(24px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {/* Top accent bar — same teal as login */}
        <div className="h-1 w-full bg-[#023341]" />

        <div className="px-8 py-5">
          {/* Logo + heading */}
          <div className="flex flex-col items-center mb-5">
            <img src={CaptainLogo} alt="RideOn" className="w-16 mb-2" />
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">
              {step === 1 ? "Create your account" : "Vehicle details"}
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {step === 1
                ? "Join the RideOn captain fleet"
                : "Tell us about your vehicle"}
            </p>
          </div>

          {/* Step progress bar */}
          <div className="flex gap-1.5 mb-5">
            <div className="flex-1 h-1 rounded-full bg-[#023341]" />
            <div
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                step === 2 ? "bg-[#023341]" : "bg-gray-200"
              }`}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 rounded-xl px-4 py-2.5 text-xs font-medium text-red-700 bg-red-50 border border-red-100">
              {error}
            </div>
          )}

          {/* ── Step 1: Personal details ───────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleNext} className="flex flex-col gap-3">
              <div>
                <label className={labelCls}>Full name</label>
                <div className="flex gap-2">
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputCls}
                    type="text"
                    placeholder="First name"
                  />
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputCls}
                    type="text"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email address</label>
                <input
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  type="email"
                  placeholder="captain@email.com"
                />
              </div>

              <div>
                <label className={labelCls}>Password</label>
                <input
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="group w-full flex items-center justify-between rounded-xl px-6 py-3 font-bold text-sm text-white mt-1 transition-all duration-200 active:scale-[0.97]"
                style={{ backgroundColor: "#023341" }}
              >
                <span>Continue</span>
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
              </button>

              <p className="text-center text-xs text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/captain-login"
                  className="text-[#023341] font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}

          {/* ── Step 2: Vehicle details ────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={submitHandler} className="flex flex-col gap-3">
              <div>
                <label className={labelCls}>Vehicle colour & plate</label>
                <div className="flex gap-2">
                  <input
                    required
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    className={inputCls}
                    type="text"
                    placeholder="e.g. Black"
                  />
                  <input
                    required
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className={inputCls}
                    type="text"
                    placeholder="KA01AB1234"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Seating capacity</label>
                <input
                  required
                  value={vehicleCapacity}
                  onChange={(e) => setVehicleCapacity(e.target.value)}
                  className={inputCls}
                  type="number"
                  min="1"
                  placeholder="e.g. 4"
                />
              </div>

              <div>
                <label className={labelCls}>Vehicle type</label>
                <select
                  required
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select type</option>
                  <option value="car">Car</option>
                  <option value="auto">Auto</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>

              <div className="flex gap-2 mt-1">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition-all active:scale-95"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M13 8H3M7 4L3 8l4 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex-1 flex items-center justify-between rounded-xl px-6 py-3 font-bold text-sm text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-60"
                  style={{ backgroundColor: "#023341" }}
                >
                  <span>
                    {loading ? "Creating account..." : "Create account"}
                  </span>
                  {!loading && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
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
              </div>

              <p className="text-center text-xs text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/captain-login"
                  className="text-[#023341] font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Switch to User — same orange button as login page */}
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

      <p className="text-white/30 text-xs mt-4 text-center">
        By proceeding, you agree to RideOn's terms of service
      </p>
    </div>
  );
};

export default CaptainSignup;
