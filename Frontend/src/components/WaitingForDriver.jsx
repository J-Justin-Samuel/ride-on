import React, { useEffect, useState } from "react";

const WaitingForDriver = ({ pickup, destination, onCancel }) => {
  const [dots, setDots] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    const timeInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      clearInterval(dotInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const pickupLabel =
    typeof pickup === "string"
      ? pickup
      : pickup?.display_name || pickup?.label || "Pickup location";

  const destinationLabel =
    typeof destination === "string"
      ? destination
      : destination?.display_name || destination?.label || "Destination";

  return (
    <div className="bg-white rounded-t-3xl shadow-2xl w-full overflow-hidden">
      {/* Orange accent bar */}
      <div className="h-1 w-full bg-[#ff5900]" />

      <div className="px-5 pt-5 pb-7">
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
              Finding your driver{dots}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Searching nearby captains
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-bold text-[#ff5900] bg-orange-50 px-3 py-1.5 rounded-full">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Radar + route combined */}
        <div className="flex items-center gap-4 mb-5">
          {/* Radar */}
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <span className="absolute w-20 h-20 rounded-full border-2 border-[#ff5900] opacity-10 animate-ping" />
            <span
              className="absolute w-14 h-14 rounded-full border-2 border-[#ff5900] opacity-20 animate-ping"
              style={{ animationDelay: "0.25s" }}
            />
            <span
              className="absolute w-8 h-8 rounded-full border-2 border-[#ff5900] opacity-30 animate-ping"
              style={{ animationDelay: "0.5s" }}
            />
            <div className="w-10 h-10 rounded-full bg-[#ff5900] shadow-lg flex items-center justify-center z-10">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
          </div>

          {/* Route */}
          <div className="flex-1 min-w-0 bg-gray-50 rounded-2xl p-3">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-1 gap-0.5 shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#ff5900]" />
                <div className="w-px h-7 bg-gray-300" />
                <div className="w-2 h-2 rounded-full bg-[#023341]" />
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    Pickup
                  </p>
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {pickupLabel}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    Drop-off
                  </p>
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {destinationLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status pills */}
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-0.5">
          {[
            { label: "Driver nearby", color: "#ff5900" },
            { label: "Route ready", color: "#023341" },
            { label: "Safe trip", color: "#10b981" },
          ].map(({ label, color }, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap border"
              style={{
                color,
                borderColor: `${color}30`,
                background: `${color}10`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
                style={{ backgroundColor: color }}
              />
              {label}
            </span>
          ))}
        </div>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-bold text-sm hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 active:scale-[0.98]"
        >
          Cancel Ride
        </button>
      </div>
    </div>
  );
};

export default WaitingForDriver;
