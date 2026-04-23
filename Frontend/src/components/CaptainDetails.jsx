import React, { useContext } from "react";
import { CaptainDataContext } from "../context/CaptainContext";

export default function CaptainDetails() {
  const { captain } = useContext(CaptainDataContext);

  const vehicle = captain?.vehicle;
  const vehicleType = vehicle?.vehicleType ?? "Car";
  const vehiclePlate = vehicle?.plate ?? "—";
  const vehicleColor = vehicle?.color ?? "";
  const hoursOnline = captain?.hoursOnline ?? 0;
  const rating = captain?.rating ?? 0;
  const avgDistance = captain?.avgDistance ?? 4.2;
  const acceptRate = captain?.acceptRate ?? 94;

  return (
    <div>
      {/* Vehicle info row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff5900">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-bold text-sm leading-tight capitalize">
              {vehicleColor} {vehicleType}
            </p>
            <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase mt-0.5">
              {vehiclePlate}
            </p>
          </div>
        </div>

        {/* Hours online badge */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#9ca3af">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z" />
          </svg>
          <span className="text-gray-500 text-xs font-bold">
            {hoursOnline.toFixed(1)}h online
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: "⭐", label: "Avg Rating", value: rating.toFixed(1) },
          {
            icon: "🛣️",
            label: "Avg Distance",
            value: `${avgDistance.toFixed(1)} km`,
          },
          { icon: "⚡", label: "Acceptance", value: `${acceptRate}%` },
        ].map(({ icon, label, value }) => (
          <div
            key={label}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-center"
          >
            <p className="text-base mb-0.5">{icon}</p>
            <p className="text-gray-900 font-extrabold text-sm leading-tight">
              {value}
            </p>
            <p className="text-gray-400 text-[9px] font-semibold uppercase tracking-wide mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
