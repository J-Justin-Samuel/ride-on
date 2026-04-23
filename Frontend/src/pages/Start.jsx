import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import bg from "/images/bg.jpg";

const Start = () => {
  const imgRef = useRef(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "scale(1)";
    }, 100);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#ff5900] flex flex-col">
      {/* Full-bleed background image */}
      <div className="absolute inset-0 z-0">
        <img
          ref={imgRef}
          src={bg}
          alt=""
          className="w-full h-full object-cover"
          style={{
            opacity: 0,
            transform: "scale(1.04)",
            transition: "opacity 0.8s ease, transform 0.9s ease",
          }}
        />
        {/* Dark gradient overlay from bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.05) 100%)",
          }}
        />
        {/* Orange tint at top */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,89,0,0.45) 0%, transparent 45%)",
          }}
        />
      </div>

      {/* Top branding */}
      <div className="relative z-10 px-6 pt-14 md:px-10 md:pt-16">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#ff5900" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3" fill="white" />
              <path
                d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            RideOn
          </span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom content */}
      <div className="relative z-10 px-6 pb-12 md:px-10 md:pb-16 max-w-lg">
        {/* Tag pill */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5"
          style={{
            backgroundColor: "rgba(255,89,0,0.25)",
            border: "1px solid rgba(255,89,0,0.5)",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff5900] animate-pulse" />
          <span className="text-white text-xs font-medium tracking-wide uppercase">
            Rides available now
          </span>
        </div>

        <h1
          className="text-white font-extrabold leading-none mb-3"
          style={{
            fontSize: "clamp(2.2rem, 8vw, 3.2rem)",
            letterSpacing: "-0.02em",
          }}
        >
          Your ride,
          <br />
          <span style={{ color: "#ff5900" }}>on demand.</span>
        </h1>

        <p className="text-white/70 text-sm md:text-base mb-8 leading-relaxed max-w-xs">
          Fast, safe, and reliable rides whenever you need them. Tap to get
          moving.
        </p>

        {/* CTA Button */}
        <Link
          to="/login"
          className="group inline-flex items-center justify-between w-full max-w-xs rounded-2xl px-6 py-4 font-bold text-sm md:text-base transition-all duration-200 active:scale-[0.97]"
          style={{ backgroundColor: "#ff5900", color: "white" }}
        >
          <span>Get started</span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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

        {/* Secondary link */}
        <p className="text-white/50 text-xs mt-5">
          Are you a captain?{" "}
          <Link
            to="/captain-login"
            className="text-white/80 underline underline-offset-2"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Start;
