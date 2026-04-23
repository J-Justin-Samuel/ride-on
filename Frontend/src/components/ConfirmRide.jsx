import React from "react";
import CarImg from "/images/car.png";
import BikeImg from "/images/motorcycle.png";
import AutoImg from "/images/auto.png";

const VEHICLE_IMAGES = { RideGo: CarImg, RideMoto: BikeImg, RideAuto: AutoImg };

export default function ConfirmRide({
  vehicle,
  pickup,
  destination,
  onConfirm,
  onBack,
}) {
  if (!vehicle) return null;

  const img = VEHICLE_IMAGES[vehicle.type] || CarImg;

  const pickupLabel =
    typeof pickup === "string"
      ? pickup
      : pickup?.display_name || pickup?.label || "Pickup location";
  const destLabel =
    typeof destination === "string"
      ? destination
      : destination?.display_name || destination?.label || "Destination";

  return (
    <div className="px-4 pt-2 pb-7 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">
            Confirm Ride
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Review your trip details
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#ff5900] transition-colors active:scale-95 bg-gray-100 hover:bg-orange-50 px-3 py-2 rounded-xl"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 4l-4 4 4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Change
        </button>
      </div>

      {/* Vehicle hero card */}
      <div
        className="rounded-2xl p-4 mb-4 flex items-center gap-4"
        style={{
          background: "linear-gradient(135deg, #023341 0%, #034a5e 100%)",
        }}
      >
        {/* Image */}
        <div className="w-24 h-16 flex items-center justify-center shrink-0 bg-white/10 rounded-xl overflow-hidden">
          <img
            src={img}
            className="h-12 w-20 object-contain drop-shadow-lg"
            alt={vehicle.type}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-base font-black text-white">{vehicle.type}</h3>
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-white/80 border border-white/20">
              {vehicle.seats} seats
            </span>
          </div>
          <p className="text-xs text-white/60 font-medium">{vehicle.desc}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span className="text-xs text-emerald-300 font-semibold">
              {vehicle.eta} away
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black text-white leading-none">
            ₹{vehicle.fare}
          </p>
          <p className="text-[10px] text-white/50 mt-1">
            {vehicle.distance?.toFixed(1)} km
          </p>
        </div>
      </div>

      {/* Route */}
      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 mb-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">
          Your trip
        </p>
        <div className="flex gap-3">
          {/* Line */}
          <div className="flex flex-col items-center pt-1 shrink-0 gap-0.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5900]" />
            <div className="w-px flex-1 border-l-2 border-dashed border-gray-300 my-1" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#023341]" />
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">
                Pickup
              </p>
              <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                {pickupLabel}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">
                Drop-off
              </p>
              <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                {destLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fare breakdown + payment in one row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Fare breakdown */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Fare
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Base</span>
              <span className="font-semibold text-gray-700">
                ₹{vehicle.baseFare}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Distance</span>
              <span className="font-semibold text-gray-700">
                ₹{vehicle.distanceFare}
              </span>
            </div>
            <div className="pt-1 mt-1 border-t border-gray-200 flex justify-between text-xs font-black">
              <span className="text-gray-700">Total</span>
              <span className="text-[#ff5900]">₹{vehicle.fare}</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex flex-col justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Payment
          </p>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#023341] flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-black text-gray-800 leading-tight">
                Cash
              </p>
              <p className="text-[10px] text-gray-400">On delivery</p>
            </div>
          </div>
          <button className="text-[10px] font-bold text-[#ff5900] text-left hover:underline">
            Change →
          </button>
        </div>
      </div>

      {/* Confirm CTA */}
      <button
        onClick={onConfirm}
        className="group w-full flex items-center justify-between rounded-2xl px-5 py-4 font-black text-sm text-white transition-all duration-200 active:scale-[0.97]"
        style={{
          background: "linear-gradient(135deg, #ff5900, #e04d00)",
          boxShadow: "0 4px 24px rgba(255,89,0,0.4)",
        }}
      >
        <span>Confirm {vehicle.type}</span>
        <div className="flex items-center gap-2">
          <span className="text-white/80 font-black">₹{vehicle.fare}</span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
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
      </button>
    </div>
  );
}
