import React, { useEffect, useState } from "react";

export default function DriverNotification({
  rideRequest,
  captain,
  onAccept,
  onDecline,
  timeoutSeconds = 20,
}) {
  const [timeLeft, setTimeLeft] = useState(timeoutSeconds);

  useEffect(() => {
    setTimeLeft(timeoutSeconds);
  }, [rideRequest, timeoutSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onDecline?.();
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, onDecline]);

  if (!rideRequest) return null;

  const progress = (timeLeft / timeoutSeconds) * 100;
  const isUrgent = timeLeft <= 7;
  const passengerName = rideRequest.passengerName || "Passenger";
  const passengerRating = Number(rideRequest.passengerRating || 4.8);
  const fare = rideRequest.estimatedFare || "—";
  const distance = Number(rideRequest.distance || 0);
  const eta = Math.max(2, Math.round((distance / 30) * 60));

  const pickup =
    rideRequest.pickup?.display_name ||
    rideRequest.pickup?.label ||
    (typeof rideRequest.pickup === "string" ? rideRequest.pickup : "Pickup");

  const destination =
    rideRequest.destination?.display_name ||
    rideRequest.destination?.label ||
    (typeof rideRequest.destination === "string"
      ? rideRequest.destination
      : "Destination");

  const handleAccept = () => {
    const captainName = captain?.fullname
      ? `${captain.fullname.firstname} ${captain.fullname.lastname ?? ""}`.trim()
      : "Captain";
    onAccept?.({
      rideId: rideRequest.rideId,
      passengerSocketId: rideRequest.passengerSocketId,
      name: captainName,
      rating: captain?.rating ?? 4.9,
      vehicle: captain?.vehicle?.vehicleType ?? "Car",
      vehicleColor: captain?.vehicle?.color ?? "",
      vehicleNumber: captain?.vehicle?.plate ?? "—",
      photo: captain?.photo ?? null,
      eta: `${eta} mins`,
    });
  };

  return (
    /* Full-screen backdrop */
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onDecline}
      />

      {/* Card — full width mobile, constrained + rounded on desktop */}
      <div className="relative w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl animate-slide-up">
        {/* Countdown bar */}
        <div className="h-1.5 w-full bg-gray-200">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${isUrgent ? "bg-red-500" : "bg-[#ff5900]"}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* White card body */}
        <div className="bg-white px-5 pt-4 pb-7">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />

          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5900] animate-pulse" />
              <span className="text-gray-900 font-extrabold text-base">
                New Ride Request
              </span>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full tabular-nums ${
                isUrgent
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          {/* Passenger + fare */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-3.5 mb-4">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-xl bg-[#023341] flex items-center justify-center shrink-0">
              <span className="text-[#ff5900] font-black text-lg leading-none">
                {passengerName[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-bold text-sm">{passengerName}</p>
              <div className="flex items-center gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    className={
                      i < Math.round(passengerRating)
                        ? "fill-amber-400"
                        : "fill-gray-200"
                    }
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
                <span className="text-gray-400 text-xs ml-1">
                  {passengerRating.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[#ff5900] font-black text-xl leading-none">
                ₹{fare}
              </p>
              <p className="text-gray-400 text-xs mt-1">{distance} km</p>
            </div>
          </div>

          {/* Route */}
          <div className="mb-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5900]" />
                <div className="w-px h-8 border-l-2 border-dashed border-gray-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#023341]" />
              </div>
              <div className="flex-1 space-y-3 min-w-0">
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                    Pickup
                  </p>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                    {pickup}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                    Drop-off
                  </p>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                    {destination}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ETA chip */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#10b981">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z" />
            </svg>
            <span className="text-emerald-700 text-xs font-bold">
              {eta} min ETA · {distance} km away
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-500 font-bold text-sm hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all duration-200 active:scale-95"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="flex-[2] py-3.5 rounded-2xl bg-[#ff5900] text-white font-extrabold text-sm shadow-lg active:scale-95 transition-all duration-200"
            >
              Accept · ₹{fare}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
