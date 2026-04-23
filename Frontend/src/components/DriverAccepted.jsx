import React, { useState } from "react";

export default function DriverAccepted({
  driver,
  pickup,
  destination,
  onCancel,
}) {
  const [showRoute, setShowRoute] = useState(false);

  const driverName = driver?.name || "Your Driver";
  const driverRating = Number(driver?.rating || 4.9);
  const vehicle = driver?.vehicle || "Sedan";
  const vehicleNumber = driver?.vehicleNumber || "KA 01 AB 1234";
  const vehicleColor = driver?.vehicleColor || "";
  const eta = driver?.eta || "3 mins";

  const pickupLabel =
    typeof pickup === "string"
      ? pickup
      : pickup?.display_name || pickup?.label || "Pickup";
  const destLabel =
    typeof destination === "string"
      ? destination
      : destination?.display_name || destination?.label || "Destination";

  const etaNum = eta.split(" ")[0];
  const etaUnit = eta.split(" ")[1] || "mins";

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center pointer-events-none">
      {/* Soft backdrop */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[3px] pointer-events-auto" />

      {/* Floating card — doesn't go full width on desktop */}
      <div
        className="relative w-full max-w-md mx-4 mb-6 pointer-events-auto rounded-3xl overflow-hidden shadow-2xl"
        style={{
          animation: "floatUp 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        {/* Gradient top bar */}
        <div
          style={{
            height: 4,
            background: "linear-gradient(90deg, #ff5900, #023341)",
          }}
        />

        {/* Card background */}
        <div className="bg-white px-5 pt-4 pb-6">
          {/* Driver found banner */}
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4"
            style={{ background: "linear-gradient(135deg, #023341, #034a5e)" }}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="#4ade80" width="16" height="16">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white leading-tight">
                Driver Found!
              </p>
              <p className="text-xs text-white/50 font-medium">
                {eta} away · heading to your pickup
              </p>
            </div>
            {/* ETA badge */}
            <div className="shrink-0 text-right">
              <p className="text-xl font-black text-[#ff5900] leading-none">
                {etaNum}
              </p>
              <p className="text-[9px] text-white/40 uppercase tracking-wider">
                {etaUnit}
              </p>
            </div>
          </div>

          {/* Driver info row */}
          <div className="flex items-center gap-3 mb-4">
            {/* Avatar */}
            {driver?.photo ? (
              <img
                src={driver.photo}
                alt={driverName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-100 shrink-0"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0"
                style={{
                  background: "linear-gradient(135deg, #023341, #034a5e)",
                }}
              >
                {driverName[0].toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-black text-gray-900 leading-tight">
                {driverName}
              </h3>
              {/* Stars */}
              <div className="flex items-center gap-0.5 my-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    viewBox="0 0 24 24"
                    width="11"
                    height="11"
                    style={{
                      fill:
                        i <= Math.round(driverRating) ? "#f59e0b" : "#e5e7eb",
                    }}
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
                <span className="text-[10px] text-gray-400 ml-1 font-semibold">
                  {driverRating}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {vehicleColor && (
                  <span className="text-[10px] text-gray-400 font-medium capitalize">
                    {vehicleColor}
                  </span>
                )}
                <span className="text-[10px] text-gray-400 font-medium">
                  {vehicle}
                </span>
                <span className="text-[10px] text-gray-300">·</span>
                <span
                  className="text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded-lg"
                  style={{ background: "#f0f4f5", color: "#023341" }}
                >
                  {vehicleNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-4" />

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              {
                label: "Call",
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="15"
                    height="15"
                  >
                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                  </svg>
                ),
                bg: "#f0f4f5",
                color: "#023341",
              },
              {
                label: "Chat",
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="15"
                    height="15"
                  >
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                ),
                bg: "#f0f4f5",
                color: "#023341",
              },
              {
                label: "Route",
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="15"
                    height="15"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                ),
                bg: showRoute ? "#023341" : "#f0f4f5",
                color: showRoute ? "white" : "#023341",
                onClick: () => setShowRoute((r) => !r),
              },
            ].map(({ label, icon, bg, color, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95"
                style={{ background: bg, color }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Route details (expandable) */}
          {showRoute && (
            <div
              className="rounded-2xl p-3 mb-4 border border-gray-100"
              style={{
                background: "#f8fafc",
                animation: "fadeSlide 0.2s ease forwards",
              }}
            >
              <div className="flex gap-3">
                <div className="flex flex-col items-center gap-0.5 pt-1 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#ff5900]" />
                  <div
                    className="w-px flex-1 border-l-2 border-dashed border-gray-200 my-0.5"
                    style={{ minHeight: 20 }}
                  />
                  <div className="w-2 h-2 rounded-full bg-[#023341]" />
                </div>
                <div className="flex-1 space-y-2.5 min-w-0">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                      Pickup
                    </p>
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {pickupLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                      Drop-off
                    </p>
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {destLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cancel */}
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold text-sm hover:border-red-200 hover:text-red-400 hover:bg-red-50 transition-all active:scale-[0.98]"
          >
            Cancel Ride
          </button>
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          from { transform: translateY(80px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
