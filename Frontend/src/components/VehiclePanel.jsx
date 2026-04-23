import React from "react";
import CarImg from "/images/car.png";
import BikeImg from "/images/motorcycle.png";
import AutoImg from "/images/auto.png";
import { haversine } from "../utils/mapUtils";

const FARE_CONFIG = {
  RideGo: {
    base: 50,
    perKm: 12,
    seats: 4,
    desc: "Comfortable · Up to 4 passengers",
    eta: "2 min",
    img: CarImg,
    badge: "Popular",
    badgeColor: "#ff5900",
    accentColor: "#ff5900",
    accentBg: "rgba(255,89,0,0.08)",
  },
  RideMoto: {
    base: 20,
    perKm: 6,
    seats: 1,
    desc: "Fastest · Beat the traffic",
    eta: "3 min",
    img: BikeImg,
    badge: "Fastest",
    badgeColor: "#023341",
    accentColor: "#023341",
    accentBg: "rgba(2,51,65,0.07)",
  },
  RideAuto: {
    base: 35,
    perKm: 9,
    seats: 3,
    desc: "Affordable · Classic auto ride",
    eta: "2 min",
    img: AutoImg,
    badge: null,
    badgeColor: null,
    accentColor: "#6b7280",
    accentBg: "rgba(107,114,128,0.06)",
  },
};

function calcFare(km, type) {
  const { base, perKm } = FARE_CONFIG[type];
  return (base + perKm * km).toFixed(0);
}

export default function VehiclePanel({
  setVehiclePanel,
  setConfirmRidePanel,
  onVehicleSelect,
  pickup,
  destination,
}) {
  const distance =
    pickup && destination
      ? haversine(pickup.lat, pickup.lon, destination.lat, destination.lon)
      : 3;

  const handleSelect = (type, info) => {
    onVehicleSelect?.({
      type,
      seats: info.seats,
      desc: info.desc,
      eta: info.eta,
      img: info.img,
      fare: calcFare(distance, type),
      baseFare: info.base,
      distanceFare: (info.perKm * distance).toFixed(2),
      distance,
    });
    setConfirmRidePanel(true);
    setVehiclePanel(false);
  };

  return (
    <div className="px-4 pb-6 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-black text-gray-900 tracking-tight">
            Choose your ride
          </h3>
          {pickup && destination && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff5900]" />
              <span className="text-xs text-gray-400 font-semibold">
                {distance.toFixed(1)} km · ~{Math.round((distance / 30) * 60)}{" "}
                min ride
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setVehiclePanel(false)}
          className="w-9 h-9 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Vehicle list */}
      <div className="flex flex-col gap-3">
        {Object.entries(FARE_CONFIG).map(([type, info]) => {
          const fare = calcFare(distance, type);
          return (
            <button
              key={type}
              onClick={() => handleSelect(type, info)}
              className="group w-full text-left active:scale-[0.98] transition-all duration-200"
            >
              <div
                className="relative rounded-2xl p-4 border-2 border-transparent transition-all duration-200 overflow-hidden"
                style={{ background: info.accentBg }}
              >
                {/* Hover border effect via inline — handled by group */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#ff5900] transition-all duration-200 pointer-events-none" />

                <div className="flex items-center gap-4">
                  {/* Vehicle image box */}
                  <div className="w-20 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 overflow-hidden border border-white/80">
                    <img
                      src={info.img}
                      className="h-10 w-16 object-contain"
                      alt={type}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-black text-gray-900">
                        {type}
                      </span>
                      {info.badge && (
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white leading-none"
                          style={{ backgroundColor: info.badgeColor }}
                        >
                          {info.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {info.desc}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {/* Seats */}
                      <span className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold bg-white/80 px-2 py-0.5 rounded-full border border-gray-100">
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="#9ca3af"
                        >
                          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                        </svg>
                        {info.seats}
                      </span>
                      {/* ETA */}
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        {info.eta} away
                      </span>
                    </div>
                  </div>

                  {/* Fare + arrow */}
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="text-xl font-black text-gray-900 leading-none">
                      ₹{fare}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      estimated
                    </p>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "#ff5900" }}
                    >
                      <svg
                        width="10"
                        height="10"
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
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
