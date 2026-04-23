/**
 * Riding.jsx  —  Frontend/src/pages/Riding.jsx
 *
 * Design:
 *  • Map is FULL SCREEN — entire viewport, no fixed height fraction
 *  • Mobile: floating bottom sheet that expands/collapses over map
 *  • Desktop: right sidebar (380px) + map fills the rest
 *  • All UI elements float over map with glassmorphism
 *  • Brand: #ff5900 orange + #023341 dark teal + white glass
 */

import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MapView from "../components/MapView.jsx";
import {
  connectSocket,
  onDriverLocationUpdate,
  onRideCompleted,
  onPassengerPickedUp,
  emitCancelRide,
} from "../utils/rideSocket.js";
import { UserDataContext } from "../context/UserContext.jsx";

const Riding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserDataContext);

  const rideData = location.state?.rideData ?? null;
  const driver = location.state?.driver ?? null;

  const [driverLocation, setDriverLocation] = useState(null);
  const [rideStatus, setRideStatus] = useState("waiting");
  const [showCancel, setShowCancel] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [panelExpanded, setPanelExpanded] = useState(false);

  const hasRealDriverData = useRef(false);
  const [hasLiveDriver, setHasLiveDriver] = useState(false);

  const pickup = rideData?.pickup;
  const destination = rideData?.destination;
  const rideId = rideData?.rideId;

  const driverName = driver?.name || "Your Driver";
  const driverRating = Number(driver?.rating || 4.9);
  const vehicle = driver?.vehicle || "Car";
  const vehicleNumber = driver?.vehicleNumber || "—";
  const eta = driver?.eta || "—";

  const pickupLabel =
    typeof pickup === "string"
      ? pickup
      : pickup?.display_name || pickup?.label || "Pickup";
  const destinationLabel =
    typeof destination === "string"
      ? destination
      : destination?.display_name || destination?.label || "Destination";

  useEffect(() => {
    if (user?._id) connectSocket(user._id, "passenger");

    const offLocation = onDriverLocationUpdate(({ lat, lon }) => {
      setDriverLocation({ lat, lon });
      if (!hasRealDriverData.current) {
        hasRealDriverData.current = true;
        setHasLiveDriver(true);
      }
    });
    const offPickedUp = onPassengerPickedUp(() => setRideStatus("inProgress"));
    const offCompleted = onRideCompleted(() => {
      setRideStatus("completed");
      setShowRating(true);
    });

    return () => {
      offLocation();
      offPickedUp();
      offCompleted();
    };
  }, [user?._id]);

  const handleCancel = () => {
    if (rideId) emitCancelRide(rideId);
    navigate("/home");
  };
  const handleRatingSubmit = () => {
    setShowRating(false);
    setTimeout(() => navigate("/home"), 300);
  };

  const useSimulation = !hasLiveDriver;
  const simulationSpeed = rideStatus === "inProgress" ? 2 : 1;

  const etaNum = String(eta).split(" ")[0];
  const etaUnit = String(eta).split(" ")[1] || "min";

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0f0f1a]">
      {/* ══════════════════════════════════════════
          FULL-SCREEN MAP
      ══════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0">
        <MapView
          pickup={pickup}
          dropoff={destination}
          userLocation={pickup}
          driverLocations={driverLocation ? [driverLocation] : []}
          onMapClick={() => {}}
          mapCenter={driverLocation ?? pickup ?? { lat: 12.9716, lon: 77.5946 }}
          zoom={14}
          simulateDriver={useSimulation}
          simulationSpeed={simulationSpeed}
        />
      </div>

      {/* ══════════════════════════════════════════
          TOP FLOATING BAR
      ══════════════════════════════════════════ */}
      <div className="absolute top-0 left-0 right-0 z-20 md:right-[380px] pointer-events-none">
        <div className="flex items-center justify-between p-4 md:p-5">
          {/* Status pill */}
          <div className="pointer-events-auto flex items-center gap-2.5 bg-white/90 backdrop-blur-md shadow-lg border border-white/60 px-4 py-2.5 rounded-2xl">
            {rideStatus === "waiting" && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
            {rideStatus === "inProgress" && (
              <span className="w-2 h-2 rounded-full bg-[#ff5900] animate-pulse" />
            )}
            {rideStatus === "completed" && (
              <span className="w-2 h-2 rounded-full bg-gray-400" />
            )}
            <span className="text-gray-900 text-xs font-bold tracking-wide">
              {rideStatus === "waiting" && `Driver arriving · ${eta}`}
              {rideStatus === "inProgress" && "Ride in progress"}
              {rideStatus === "completed" && "Trip complete"}
            </span>
            {useSimulation && (
              <span className="text-[10px] text-gray-400">· demo</span>
            )}
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
                {rideStatus === "waiting" && "Driver on the way"}
                {rideStatus === "inProgress" && "Enjoy your ride"}
                {rideStatus === "completed" && "You've arrived!"}
              </h2>
            </div>

            {/* Driver card */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                {driver?.photo ? (
                  <img
                    src={driver.photo}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0"
                    alt={driverName}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#023341] to-[#034a5e] flex items-center justify-center text-white text-2xl font-black shrink-0">
                    {driverName[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-gray-900 text-base truncate">
                    {driverName}
                  </p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        viewBox="0 0 24 24"
                        className={`w-3.5 h-3.5 ${i <= Math.round(driverRating) ? "fill-amber-400" : "fill-gray-200"}`}
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-400 ml-1 font-medium">
                      {driverRating}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {vehicle} · {vehicleNumber}
                  </p>
                </div>

                {/* ETA badge */}
                <div className="bg-[#ff5900]/8 border border-[#ff5900]/15 rounded-xl px-3.5 py-2.5 text-center shrink-0">
                  <p className="text-[#ff5900] font-black text-2xl leading-none">
                    {etaNum}
                  </p>
                  <p className="text-[#ff5900]/50 text-[9px] font-bold uppercase tracking-widest mt-0.5">
                    {etaUnit}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: "ri-phone-line", label: "Call" },
                { icon: "ri-message-2-line", label: "Chat" },
                { icon: "ri-share-line", label: "Share" },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-xs hover:bg-gray-200 transition-colors active:scale-95"
                >
                  <i className={`${icon} text-base`} />
                  {label}
                </button>
              ))}
            </div>

            {/* Route card */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Route
              </p>
              <div className="flex gap-3">
                <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow shadow-emerald-200" />
                  <div
                    className="w-px flex-1 border-l-2 border-dashed border-gray-200"
                    style={{ minHeight: 30 }}
                  />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5900] shadow shadow-orange-200" />
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
                      {destinationLabel}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end justify-center gap-1.5">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                    Fare
                  </p>
                  <p className="text-xl font-black text-gray-900 leading-none">
                    ₹{rideData?.estimatedFare || "—"}
                  </p>
                  <span className="text-[10px] bg-gray-100 text-gray-500 font-semibold rounded-lg px-2 py-0.5">
                    Cash
                  </span>
                </div>
              </div>
            </div>

            {/* Status banners */}
            {rideStatus === "inProgress" && (
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#ff5900]/10 flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5900] animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-orange-900">
                    Ride underway
                  </p>
                  <p className="text-[10px] text-orange-400 font-medium mt-0.5">
                    Sit back and enjoy the trip!
                  </p>
                </div>
              </div>
            )}

            <div className="flex-1" />

            {/* Cancel */}
            {rideStatus === "waiting" && (
              <>
                {showCancel ? (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                    <p className="text-sm text-center text-gray-700 font-semibold mb-3">
                      Cancel this ride?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCancel(false)}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                      >
                        Keep ride
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm active:scale-95 hover:bg-red-600 transition-colors"
                      >
                        Yes, cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCancel(true)}
                    className="w-full py-3 rounded-2xl border border-gray-200 text-gray-400 font-semibold text-sm hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
                  >
                    Cancel Ride
                  </button>
                )}
              </>
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
          {/* Orange top bar */}
          <div className="h-1 bg-[#ff5900]" />

          {/* Drag handle */}
          <button
            onClick={() => setPanelExpanded(!panelExpanded)}
            className="w-full flex justify-center pt-3 pb-1"
            aria-label="Expand panel"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </button>

          {/* ── Always visible: Driver strip ── */}
          <div className="px-4 pt-1 pb-3">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              {driver?.photo ? (
                <img
                  src={driver.photo}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                  alt={driverName}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#023341] to-[#034a5e] flex items-center justify-center text-white text-lg font-black shrink-0">
                  {driverName[0].toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-gray-900 text-sm truncate">
                  {driverName}
                </p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      viewBox="0 0 24 24"
                      className={`w-2.5 h-2.5 ${i <= Math.round(driverRating) ? "fill-amber-400" : "fill-gray-200"}`}
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                  <span className="text-[10px] text-gray-400 ml-1 font-medium">
                    {vehicle}
                  </span>
                </div>
              </div>

              {/* ETA + fare side by side */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-center bg-[#ff5900]/8 border border-[#ff5900]/15 rounded-xl px-3 py-2">
                  <p className="text-[#ff5900] font-black text-lg leading-none">
                    {etaNum}
                  </p>
                  <p className="text-[#ff5900]/50 text-[9px] font-bold uppercase tracking-wider">
                    {etaUnit}
                  </p>
                </div>
                <div className="text-center bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                  <p className="text-gray-900 font-black text-lg leading-none">
                    ₹{rideData?.estimatedFare || "—"}
                  </p>
                  <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">
                    Cash
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons — always visible */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { icon: "ri-phone-line", label: "Call" },
                { icon: "ri-message-2-line", label: "Chat" },
                { icon: "ri-share-line", label: "Share" },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-xs hover:bg-gray-200 transition-colors active:scale-95"
                >
                  <i className={`${icon} text-sm`} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Expandable section ── */}
          <div
            className="overflow-hidden transition-all duration-500 ease-in-out"
            style={{ maxHeight: panelExpanded ? "400px" : "0px" }}
          >
            <div className="px-4 pb-4 flex flex-col gap-3 border-t border-gray-100 pt-3">
              {/* Route */}
              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                  Route
                </p>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div
                      className="w-px flex-1 border-l-2 border-dashed border-gray-200"
                      style={{ minHeight: 22 }}
                    />
                    <div className="w-2 h-2 rounded-full bg-[#ff5900]" />
                  </div>
                  <div className="flex-1 space-y-2.5 min-w-0">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Pickup
                      </p>
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {pickupLabel}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Drop-off
                      </p>
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {destinationLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {rideStatus === "inProgress" && (
                <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#ff5900] animate-pulse shrink-0" />
                  <p className="text-xs font-semibold text-orange-800">
                    Your ride is underway — enjoy the trip!
                  </p>
                </div>
              )}

              {rideStatus === "waiting" && (
                <>
                  {showCancel ? (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-3">
                      <p className="text-sm text-center text-gray-600 font-medium mb-2.5">
                        Cancel this ride?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowCancel(false)}
                          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm"
                        >
                          Keep ride
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm active:scale-95"
                        >
                          Yes, cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCancel(true)}
                      className="w-full py-3 rounded-2xl border border-gray-200 text-gray-400 font-semibold text-sm hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
                    >
                      Cancel Ride
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RATING MODAL
      ══════════════════════════════════════════ */}
      {showRating && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-6 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-white w-full md:max-w-sm rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl"
            style={{
              animation:
                "slideUp 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
          >
            <div className="h-1 bg-[#ff5900]" />
            {/* Drag handle on mobile */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 md:hidden" />

            <div className="px-6 py-7 text-center">
              {/* Success icon */}
              <div className="relative w-20 h-20 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-200">
                  <svg viewBox="0 0 24 24" fill="white" className="w-9 h-9">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              </div>

              <div className="w-8 h-1 rounded-full bg-[#ff5900] mx-auto mb-4" />
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">
                Trip Complete!
              </h2>
              <p className="text-gray-400 text-sm font-medium mb-0.5">
                ₹{rideData?.estimatedFare || "—"} · {rideData?.distance || "—"}{" "}
                km
              </p>
              <p className="text-gray-300 text-xs mb-6">
                Thanks for riding with RideOn 🚗
              </p>

              {/* Stars */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Rate your driver
                </p>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="transition-all duration-150 hover:scale-125 active:scale-95"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className={`w-9 h-9 transition-colors duration-150 ${s <= (hoverRating || rating) ? "fill-amber-400" : "fill-gray-200"}`}
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleRatingSubmit}
                className="w-full py-4 rounded-2xl font-extrabold text-sm text-white transition-all duration-200 active:scale-[0.98]"
                style={{ backgroundColor: rating > 0 ? "#ff5900" : "#9ca3af" }}
              >
                {rating > 0 ? "Submit & Go Home" : "Skip for now"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Riding;
