/**
 * CaptainRiding.jsx  —  Frontend/src/pages/CaptainRiding.jsx
 *
 * Design:
 *  • Map is FULL SCREEN — entire viewport, no fixed 44% height
 *  • Mobile: floating bottom panel over map (always-visible strip + expandable)
 *  • Desktop: right sidebar (380px) + map fills everything left
 *  • All overlays use glassmorphism matching Riding.jsx style
 *  • Clean buttons — no emojis
 *  • Completed screen unchanged
 */

import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext.jsx";
import MapView from "../components/MapView.jsx";
import {
  emitDriverLiveLocation,
  emitCompleteRide,
  emitPassengerPickedUp,
  onRideCancelled,
} from "../utils/rideSocket.js";

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function CaptainRiding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { captain } = useContext(CaptainDataContext);
  const rideData = location.state?.rideData ?? null;

  const [rideStatus, setRideStatus] = useState("pickup"); // pickup | inProgress | completed
  const [elapsed, setElapsed] = useState(0);
  const [hasGPS, setHasGPS] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(false);

  const locationRef = useRef(null);
  const timerRef = useRef(null);

  const { passengerSocketId, rideId, pickup, destination } = rideData ?? {};
  const passengerName = rideData?.passengerName || "Passenger";
  const estimatedFare = rideData?.estimatedFare || "—";
  const distance = rideData?.distance || "—";

  const pickupLabel =
    typeof pickup === "string"
      ? pickup
      : pickup?.display_name || pickup?.label || "Pickup";
  const destLabel =
    typeof destination === "string"
      ? destination
      : destination?.display_name || destination?.label || "Destination";

  useEffect(() => {
    if (!passengerSocketId) return;

    locationRef.current = setInterval(() => {
      navigator.geolocation?.getCurrentPosition(
        ({ coords }) => {
          emitDriverLiveLocation({
            passengerSocketId,
            lat: coords.latitude,
            lon: coords.longitude,
          });
          setHasGPS(true);
        },
        (err) => console.warn("GPS:", err),
        { enableHighAccuracy: true },
      );
    }, 5000);

    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);

    const offCancelled = onRideCancelled(() => {
      clearInterval(locationRef.current);
      clearInterval(timerRef.current);
      navigate("/captain-home");
    });

    return () => {
      clearInterval(locationRef.current);
      clearInterval(timerRef.current);
      offCancelled();
    };
  }, [passengerSocketId]);

  const handlePickedUp = () => {
    emitPassengerPickedUp({ rideId, passengerSocketId });
    setRideStatus("inProgress");
  };

  const handleComplete = () => {
    clearInterval(locationRef.current);
    clearInterval(timerRef.current);
    emitCompleteRide({ rideId, passengerSocketId });
    setRideStatus("completed");
  };

  // ── COMPLETED VIEW (unchanged) ───────────────────────────────────────────
  if (rideStatus === "completed") {
    return (
      <div className="h-screen bg-[#023341] flex flex-col overflow-hidden">
        <div className="flex flex-col items-center justify-center px-6 pt-14 pb-6 shrink-0">
          <div className="relative w-20 h-20 mb-5">
            <span className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl">
              <svg viewBox="0 0 24 24" fill="white" className="w-10 h-10">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          </div>
          <div className="w-10 h-1 rounded-full bg-[#ff5900] mb-3" />
          <h2 className="text-white font-black text-2xl mb-1">
            Ride Complete!
          </h2>
          <p className="text-white/50 text-sm">
            Great job, {captain?.fullname?.firstname || "Captain"}!
          </p>
        </div>

        <div className="flex-1 bg-white rounded-t-3xl flex flex-col overflow-hidden">
          <div className="h-1 bg-[#ff5900] shrink-0" />
          <div className="flex-1 px-5 md:px-8 md:max-w-lg md:mx-auto w-full pt-5 pb-6 flex flex-col gap-3 overflow-hidden">
            {/* Earnings */}
            <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 shrink-0">
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                  Earned this trip
                </p>
                <p className="text-[#ff5900] font-black text-3xl leading-none">
                  ₹{estimatedFare}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {distance} km · {fmt(elapsed)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#ff5900">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                </svg>
              </div>
            </div>
            {/* Route recap */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 shrink-0">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-3">
                Trip Summary
              </p>
              <div className="flex gap-3">
                <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#ff5900]" />
                  <div
                    className="w-px flex-1 border-l-2 border-dashed border-gray-300"
                    style={{ minHeight: 24 }}
                  />
                  <div className="w-2 h-2 rounded-full bg-[#023341]" />
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      Pickup
                    </p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {pickupLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      Drop-off
                    </p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {destLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Passenger */}
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#023341] flex items-center justify-center shrink-0">
                <span className="text-[#ff5900] font-black text-base">
                  {passengerName[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-gray-900 font-bold text-sm">
                  {passengerName}
                </p>
                <p className="text-gray-400 text-xs">Passenger</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-gray-400">Cash</p>
                <p className="text-sm font-bold text-gray-900">
                  ₹{estimatedFare}
                </p>
              </div>
            </div>
            <div className="flex-1" />
            <button
              onClick={() => navigate("/captain-home")}
              className="w-full py-4 rounded-2xl bg-[#023341] text-white font-extrabold text-sm hover:bg-[#034a5e] transition-all active:scale-95 shrink-0"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVE RIDE VIEW ─────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0f0f1a]">
      {/* ══════════════════════════════════════════
          FULL-SCREEN MAP
      ══════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0">
        <MapView
          pickup={pickup}
          dropoff={destination}
          userLocation={null}
          driverLocations={[]}
          onMapClick={() => {}}
          mapCenter={pickup ?? { lat: 12.9716, lon: 77.5946 }}
          zoom={14}
          simulateDriver={!hasGPS}
          simulationSpeed={rideStatus === "inProgress" ? 1.5 : 1}
        />
      </div>

      {/* ══════════════════════════════════════════
          TOP FLOATING BAR
          On desktop, clamp to left of sidebar
      ══════════════════════════════════════════ */}
      <div className="absolute top-0 left-0 right-0 z-20 md:right-[380px] pointer-events-none">
        <div className="flex items-center justify-between p-4 md:p-5">
          {/* Timer + status */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Elapsed timer */}
            <div className="flex items-center gap-2 bg-[#023341]/90 backdrop-blur-md shadow-lg border border-white/10 px-4 py-2.5 rounded-2xl">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff5900] animate-pulse" />
              <span className="text-white font-bold text-xs tabular-nums tracking-widest">
                {fmt(elapsed)}
              </span>
            </div>

            {/* Status pill */}
            <div
              className={`flex items-center gap-2 backdrop-blur-md shadow-lg border border-white/20 px-4 py-2.5 rounded-2xl ${rideStatus === "pickup" ? "bg-[#ff5900]/90" : "bg-emerald-500/90"}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-xs font-bold tracking-wide uppercase">
                {rideStatus === "pickup" ? "To Pickup" : "In Progress"}
              </span>
              {!hasGPS && (
                <span className="text-white/60 text-[10px]">· sim</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP — RIGHT SIDEBAR
      ══════════════════════════════════════════ */}
      <div className="hidden md:flex absolute top-0 right-0 bottom-0 z-10 w-[380px] flex-col bg-white shadow-2xl">
        <div className="h-1 bg-[#ff5900] shrink-0" />

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pt-6 pb-8 flex flex-col gap-4 min-h-full">
            {/* Header */}
            <div className="pt-14">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Active ride
              </p>
              <h2 className="text-xl font-black text-gray-900 mt-0.5 leading-tight">
                {rideStatus === "pickup"
                  ? "Heading to pickup"
                  : "Ride underway"}
              </h2>
            </div>

            {/* Passenger card */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Passenger
              </p>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#023341] to-[#034a5e] flex items-center justify-center text-[#ff5900] font-black text-2xl shrink-0">
                  {passengerName[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-gray-900 text-base truncate">
                    {passengerName}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5 font-medium">
                    {distance} km ·{" "}
                    <span className="text-[#ff5900] font-bold">
                      ₹{estimatedFare}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {["ri-phone-line", "ri-message-2-line"].map((icon) => (
                    <button
                      key={icon}
                      className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                    >
                      <i className={`${icon} text-gray-500 text-base`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Route card */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Route
              </p>
              <div className="flex gap-3">
                <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5900] shadow shadow-orange-200" />
                  <div
                    className="w-px flex-1 border-l-2 border-dashed border-gray-200"
                    style={{ minHeight: 30 }}
                  />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#023341] shadow shadow-slate-200" />
                </div>
                <div className="flex-1 space-y-3 min-w-0">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      Pickup
                    </p>
                    <p className="text-xs font-semibold text-gray-800 truncate mt-0.5 leading-snug">
                      {pickupLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      Drop-off
                    </p>
                    <p className="text-xs font-semibold text-gray-800 truncate mt-0.5 leading-snug">
                      {destLabel}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end justify-center gap-1.5">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                    Fare
                  </p>
                  <p className="text-xl font-black text-gray-900 leading-none">
                    ₹{estimatedFare}
                  </p>
                  <span className="text-[10px] bg-gray-100 text-gray-500 font-semibold rounded-lg px-2 py-0.5">
                    Cash
                  </span>
                </div>
              </div>
            </div>

            {/* Trip duration */}
            <div className="flex items-center gap-3 bg-[#023341]/5 border border-[#023341]/10 rounded-2xl px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-[#023341]/10 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#023341">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Trip duration
                </p>
                <p className="text-sm font-extrabold text-[#023341] tabular-nums">
                  {fmt(elapsed)}
                </p>
              </div>
            </div>

            <div className="flex-1" />

            {/* CTA buttons */}
            {rideStatus === "pickup" && (
              <button
                onClick={handlePickedUp}
                className="w-full py-4 rounded-2xl bg-[#ff5900] text-white font-extrabold text-sm tracking-wide shadow-lg shadow-orange-200/50 hover:bg-orange-600 transition-all active:scale-[0.98]"
              >
                Passenger Picked Up
              </button>
            )}
            {rideStatus === "inProgress" && (
              <button
                onClick={handleComplete}
                className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-200/50 hover:bg-emerald-600 transition-all active:scale-[0.98]"
              >
                Complete Ride · ₹{estimatedFare}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE — FLOATING BOTTOM SHEET
      ══════════════════════════════════════════ */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 z-20 px-3 pb-3">
        <div
          className="rounded-3xl overflow-hidden shadow-2xl border border-white/20"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Brand bar */}
          <div className="h-1 bg-[#ff5900]" />

          {/* Drag handle */}
          <button
            onClick={() => setPanelExpanded(!panelExpanded)}
            className="w-full flex justify-center pt-3 pb-1"
            aria-label="Expand panel"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </button>

          {/* ── Always visible: passenger strip ── */}
          <div className="px-4 pt-1 pb-3">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#023341] to-[#034a5e] flex items-center justify-center text-[#ff5900] font-black text-lg shrink-0">
                {passengerName[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-gray-900 text-sm truncate">
                  {passengerName}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {distance} km ·{" "}
                  <span className="text-[#ff5900] font-bold">
                    ₹{estimatedFare}
                  </span>
                </p>
              </div>

              {/* Contact buttons */}
              <div className="flex gap-2 shrink-0">
                {["ri-phone-line", "ri-message-2-line"].map((icon) => (
                  <button
                    key={icon}
                    className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"
                  >
                    <i className={`${icon} text-gray-500 text-sm`} />
                  </button>
                ))}
              </div>
            </div>

            {/* CTA — always visible on mobile */}
            <div className="mt-3">
              {rideStatus === "pickup" && (
                <button
                  onClick={handlePickedUp}
                  className="w-full py-3.5 rounded-2xl bg-[#ff5900] text-white font-extrabold text-sm tracking-wide shadow-lg shadow-orange-200/40 hover:bg-orange-600 transition-all active:scale-[0.98]"
                >
                  Passenger Picked Up
                </button>
              )}
              {rideStatus === "inProgress" && (
                <button
                  onClick={handleComplete}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-200/40 hover:bg-emerald-600 transition-all active:scale-[0.98]"
                >
                  Complete Ride · ₹{estimatedFare}
                </button>
              )}
            </div>
          </div>

          {/* ── Expandable: route details ── */}
          <div
            className="overflow-hidden transition-all duration-500 ease-in-out"
            style={{ maxHeight: panelExpanded ? "300px" : "0px" }}
          >
            <div className="px-4 pb-4 flex flex-col gap-3 border-t border-gray-100 pt-3">
              {/* Route */}
              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                  Route
                </p>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#ff5900]" />
                    <div
                      className="w-px flex-1 border-l-2 border-dashed border-gray-200"
                      style={{ minHeight: 22 }}
                    />
                    <div className="w-2 h-2 rounded-full bg-[#023341]" />
                  </div>
                  <div className="flex-1 space-y-2.5 min-w-0">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Pickup
                      </p>
                      <p className="text-xs font-semibold text-gray-800 truncate mt-0.5">
                        {pickupLabel}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Drop-off
                      </p>
                      <p className="text-xs font-semibold text-gray-800 truncate mt-0.5">
                        {destLabel}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end justify-center gap-1">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      Fare
                    </p>
                    <p className="text-base font-black text-gray-900 leading-none">
                      ₹{estimatedFare}
                    </p>
                    <span className="text-[10px] bg-gray-100 text-gray-500 font-semibold rounded-lg px-2 py-0.5 mt-0.5">
                      Cash
                    </span>
                  </div>
                </div>
              </div>

              {/* Trip timer */}
              <div className="flex items-center gap-3 bg-[#023341]/5 border border-[#023341]/10 rounded-2xl px-3.5 py-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#023341]/10 flex items-center justify-center shrink-0">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="#023341"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    Duration
                  </p>
                  <p className="text-sm font-extrabold text-[#023341] tabular-nums">
                    {fmt(elapsed)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
