import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";
import CaptainDetails from "../components/CaptainDetails";
import DriverNotification from "../components/DriverNotification";
import {
  connectSocket,
  disconnectSocket,
  onNewRideRequest,
  onRideTaken,
  onRideCancelled,
  emitDriverAccept,
  emitDriverLocation,
} from "../utils/rideSocket";

export default function CaptainHome() {
  const navigate = useNavigate();
  const { captain } = useContext(CaptainDataContext);
  const [isOnline, setIsOnline] = useState(false);
  const [rideRequest, setRideRequest] = useState(null);
  const locationIntervalRef = useRef(null);

  const name = captain?.fullname?.firstname
    ? `${captain.fullname.firstname} ${captain.fullname.lastname ?? ""}`.trim()
    : "Captain";

  useEffect(() => {
    if (!captain?._id) return;
    connectSocket(captain._id, "driver");
    const offRide = onNewRideRequest(setRideRequest);
    const offTaken = onRideTaken(() => setRideRequest(null));
    const offCancelled = onRideCancelled(() => setRideRequest(null));
    return () => {
      offRide();
      offTaken();
      offCancelled();
      disconnectSocket();
      clearInterval(locationIntervalRef.current);
    };
  }, [captain?._id]);

  const startLocation = () => {
    if (!navigator.geolocation) return;
    locationIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) =>
          emitDriverLocation({ lat: coords.latitude, lon: coords.longitude }),
        (err) => console.warn("GPS:", err),
        { enableHighAccuracy: true },
      );
    }, 10000);
  };

  const handleToggle = () => {
    setIsOnline((prev) => {
      if (!prev) startLocation();
      else clearInterval(locationIntervalRef.current);
      return !prev;
    });
  };

  const handleAccept = (payload) => {
    emitDriverAccept(payload);
    const snap = rideRequest;
    setRideRequest(null);
    navigate("/captain-riding", {
      state: {
        rideData: {
          rideId: snap.rideId,
          passengerSocketId: snap.passengerSocketId,
          pickup: snap.pickup,
          destination: snap.destination,
          passengerName: snap.passengerName,
          estimatedFare: snap.estimatedFare,
          distance: snap.distance,
        },
      },
    });
  };

  return (
    <div className="h-screen overflow-hidden bg-[#023341] flex flex-col ">
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="w-full max-w-2xl mx-auto px-5 pt-12 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <span className="text-[#ff5900] font-black text-lg leading-none">
              {name[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-0.5">
              RideOn Captain
            </p>
            <h1 className="text-white font-extrabold text-base leading-tight">
              {name}
            </h1>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all duration-200 active:scale-95 ${
            isOnline
              ? "bg-[#ff5900] text-white shadow-lg"
              : "bg-white/10 text-white/70 border border-white/20"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-all ${isOnline ? "bg-white animate-pulse" : "bg-white/30"}`}
          />
          {isOnline ? "ONLINE" : "GO ONLINE"}
        </button>
      </div>

      {/* ── STATS ──────────────────────────────────────────────────────── */}
      <div className="w-full max-w-2xl mx-auto px-5 pb-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Today's Earnings",
              value: `₹${Number(captain?.earnings ?? 0).toFixed(0)}`,
              color: "text-[#ff5900]",
            },
            {
              label: "Rating",
              value: (captain?.rating ?? 0).toFixed(1),
              color: "text-amber-400",
            },
            {
              label: "Total Rides",
              value: String(captain?.totalRides ?? 0),
              color: "text-emerald-400",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white/10 border border-white/15 rounded-2xl px-3 py-3"
            >
              <p className="text-white/40 text-[8px] font-bold uppercase tracking-widest mb-1.5 leading-tight">
                {label}
              </p>
              <p className={`${color} text-xl font-black leading-none`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHITE CARD ─────────────────────────────────────────────────── */}
      <div className="flex-1 bg-white rounded-t-3xl w-full max-w-2xl mx-auto">
        {/* Orange accent top bar */}
        <div className="h-1 w-full bg-[#ff5900] rounded-t-3xl" />

        <div className="px-5 pt-5 pb-8">
          {/* Captain details component */}
          <CaptainDetails />

          <div className="h-px bg-gray-100 my-5" />

          {/* Status section */}
          {isOnline ? (
            <div className="flex flex-col items-center py-4">
              {/* Radar rings */}
              <div className="relative w-28 h-28 flex items-center justify-center mb-5">
                {[104, 74, 44].map((size, i) => (
                  <span
                    key={i}
                    className="absolute rounded-full border-2 border-[#ff5900]/25"
                    style={{
                      width: size,
                      height: size,
                      animation: `radarPing 2.2s ease-out ${i * 0.45}s infinite`,
                    }}
                  />
                ))}
                <div className="relative z-10 w-12 h-12 rounded-full bg-[#023341] flex items-center justify-center shadow-lg">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#ff5900"
                  >
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-900 font-extrabold text-lg mb-1">
                Scanning for rides nearby
              </h3>
              <p className="text-gray-400 text-sm mb-4 text-center">
                Passengers within 5 km can find you
              </p>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 text-xs font-bold tracking-widest uppercase">
                  Live · Sharing Location
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 rounded-3xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="#d1d5db">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
              </div>
              <h3 className="text-gray-700 font-extrabold text-lg mb-1">
                You're offline
              </h3>
              <p className="text-gray-400 text-sm mb-5">
                Go online to start receiving rides
              </p>
              <button
                onClick={handleToggle}
                className="group flex items-center justify-between gap-3 px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-[#023341] hover:bg-[#034a5e] transition-all duration-200 active:scale-95"
              >
                <span>Go Online Now</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
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
            </div>
          )}
        </div>
      </div>

      {/* Driver notification popup */}
      {rideRequest && (
        <DriverNotification
          rideRequest={rideRequest}
          captain={captain}
          onAccept={handleAccept}
          onDecline={() => setRideRequest(null)}
          timeoutSeconds={20}
        />
      )}

      <style>{`
        @keyframes radarPing {
          0%   { transform: scale(0.4); opacity: 0.9; }
          100% { transform: scale(1);   opacity: 0; }
        }
      `}</style>
    </div>
  );
}
