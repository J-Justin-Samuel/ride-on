/**
 * Home.jsx  —  Frontend/src/pages/Home.jsx
 *
 * Changes from original:
 *  • LocationInput now gets showMyLocation prop for GPS pickup
 *  • MapView gets simulateDriver={false} (simulation only on Riding/CaptainRiding)
 *  • All other logic unchanged
 */

import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import RideonLogo from "/images/RideonLogo.png";
import "remixicon/fonts/remixicon.css";

import VehiclePanel from "../components/VehiclePanel.jsx";
import ConfirmRide from "../components/ConfirmRide.jsx";
import LocationInput from "../components/LocationInput.jsx";
import MapView from "../components/MapView.jsx";
import WaitingForDriver from "../components/WaitingForDriver.jsx";
import DriverAccepted from "../components/DriverAccepted.jsx";

import {
  connectSocket,
  emitRideRequest,
  onDriverAccepted,
  onNoDrivers,
  onRideCompleted,
  emitCancelRide,
} from "../utils/rideSocket.js";

import { UserDataContext } from "../context/UserContext.jsx";

const RIDE_STATE = {
  IDLE: "idle",
  SEARCHING: "searching",
  DRIVER_ACCEPTED: "driverAccepted",
  COMPLETED: "completed",
};

const Home = () => {
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [rideState, setRideState] = useState(RIDE_STATE.IDLE);
  const [currentRideId, setCurrentRideId] = useState(null);
  const [acceptedDriver, setAcceptedDriver] = useState(null);
  const [noDriversMsg, setNoDriversMsg] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Refs to always hold latest values (fix stale-closure in socket callbacks)
  const pickupRef = useRef(pickupLocation);
  const destinationRef = useRef(destinationLocation);
  const vehicleRef = useRef(selectedVehicle);

  useEffect(() => {
    pickupRef.current = pickupLocation;
  }, [pickupLocation]);
  useEffect(() => {
    destinationRef.current = destinationLocation;
  }, [destinationLocation]);
  useEffect(() => {
    vehicleRef.current = selectedVehicle;
  }, [selectedVehicle]);

  const vehiclePanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);

  const navigate = useNavigate();
  const { user } = useContext(UserDataContext);
  const userId = user?._id;

  // ── Socket setup ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    connectSocket(userId, "passenger");

    const offAccepted = onDriverAccepted(({ rideId, driver }) => {
      setCurrentRideId(rideId);
      setAcceptedDriver(driver);
      setRideState(RIDE_STATE.DRIVER_ACCEPTED);
      navigate("/riding", {
        state: {
          driver,
          rideData: {
            rideId,
            pickup: pickupRef.current,
            destination: destinationRef.current,
            estimatedFare: vehicleRef.current?.fare,
            distance: vehicleRef.current?.distance,
          },
        },
      });
    });

    const offNoDrivers = onNoDrivers(({ message }) => {
      setNoDriversMsg(message);
      setTimeout(() => setNoDriversMsg(null), 4000);
    });

    const offCompleted = onRideCompleted(() => {
      setRideState(RIDE_STATE.COMPLETED);
      setTimeout(() => {
        setRideState(RIDE_STATE.IDLE);
        setAcceptedDriver(null);
        setCurrentRideId(null);
      }, 3000);
    });

    return () => {
      offAccepted();
      offNoDrivers();
      offCompleted();
    };
  }, [userId]);

  // ── GSAP panel animations ────────────────────────────────────────────────
  useGSAP(() => {
    gsap.to(vehiclePanelRef.current, {
      transform: vehiclePanel ? "translateY(0)" : "translateY(100%)",
      duration: 0.4,
      ease: "power3.out",
    });
  }, [vehiclePanel]);

  useGSAP(() => {
    gsap.to(confirmRidePanelRef.current, {
      transform: confirmRidePanel ? "translateY(0)" : "translateY(100%)",
      duration: 0.4,
      ease: "power3.out",
    });
  }, [confirmRidePanel]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleRideConfirmed = () => {
    setConfirmRidePanel(false);
    emitRideRequest({
      pickup: pickupLocation,
      destination: destinationLocation,
      passengerName: user?.fullname?.firstname || "User",
      passengerRating: 4.8,
      estimatedFare: selectedVehicle?.fare,
      distance: selectedVehicle?.distance,
    });
    setRideState(RIDE_STATE.SEARCHING);
  };

  const handleCancelRide = () => {
    if (currentRideId) emitCancelRide(currentRideId);
    setRideState(RIDE_STATE.IDLE);
    setAcceptedDriver(null);
    setCurrentRideId(null);
  };

  const isIdle = rideState === RIDE_STATE.IDLE;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-900">
      {/* ── MAP ── */}
      <div className="absolute inset-0 z-0">
        <MapView
          pickup={pickupLocation}
          dropoff={destinationLocation}
          userLocation={pickupLocation}
          driverLocations={acceptedDriver ? [acceptedDriver] : []}
          onMapClick={() => {}}
          mapCenter={pickupLocation ?? { lat: 12.9716, lon: 77.5946 }}
          zoom={13}
          simulateDriver={false}
        />
      </div>

      {/* ── Overlay behind panels ── */}
      {(vehiclePanel || confirmRidePanel) && (
        <div
          className="absolute inset-0 bg-black/20 z-10"
          onClick={() => {
            setVehiclePanel(false);
            setConfirmRidePanel(false);
          }}
        />
      )}

      {/* ── No drivers toast ── */}
      {noDriversMsg && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-500 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl whitespace-nowrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {noDriversMsg}
        </div>
      )}

      {/* ── Trip completed overlay ── */}
      {rideState === RIDE_STATE.COMPLETED && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm px-6">
          <div className="bg-white rounded-3xl px-8 py-10 text-center shadow-2xl w-full max-w-xs">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-40" />
              <div className="relative w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" fill="white" className="w-9 h-9">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
            </div>
            <div className="w-10 h-1 rounded-full bg-[#ff5900] mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Trip Completed!
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              Thanks for riding with RideOn 🚗
            </p>
          </div>
        </div>
      )}

      {/* ── TOP UI (only in idle state) ── */}
      <div
        className="absolute top-0 left-0 right-0 z-20 transition-opacity duration-300"
        style={{
          opacity: isIdle ? 1 : 0,
          pointerEvents: isIdle ? "auto" : "none",
        }}
      >
        <div className="flex items-center justify-between px-4 pt-8 pb-3 md:px-8">
          <div>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
              Hi
            </p>
            <h4 className="text-lg font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
              {user?.fullname?.firstname
                ? `${user.fullname.firstname}`
                : "Where to?"}
            </h4>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl bg-white/95 p-1">
            <img
              src={RideonLogo}
              className="w-12 h-12 object-contain"
              alt="RideOn"
            />
          </div>
        </div>

        <div className="mx-4 md:mx-8 md:max-w-md bg-white rounded-2xl shadow-2xl overflow-visible">
          <div className="h-1 w-full bg-[#ff5900] rounded-t-2xl" />
          <div className="px-4 pt-4 pb-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Plan your trip
            </p>

            <div className="flex gap-3 items-stretch">
              {/* Timeline dots */}
              <div
                className="flex flex-col items-center py-1 gap-0"
                style={{ paddingTop: "22px" }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5900] shrink-0" />
                <div
                  className="w-px flex-1 bg-gray-200 my-1"
                  style={{ minHeight: 28 }}
                />
                <div className="w-2.5 h-2.5 rounded-full bg-[#023341] shrink-0" />
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <LocationInput
                  label="PICKUP"
                  value={pickupLocation}
                  onChange={setPickupLocation}
                  onSelect={(loc) => setPickupLocation(loc)}
                  accentColor="#ff5900"
                  showMyLocation={true}
                />
                <LocationInput
                  label="DROP-OFF"
                  value={destinationLocation}
                  onChange={setDestinationLocation}
                  onSelect={(loc) => {
                    setDestinationLocation(loc);
                    if (pickupLocation) setVehiclePanel(true);
                  }}
                  accentColor="#023341"
                />
              </div>
            </div>

            {pickupLocation && destinationLocation && (
              <button
                onClick={() => setVehiclePanel(true)}
                className="group w-full mt-3 flex items-center justify-between rounded-xl px-5 py-3 font-bold text-sm text-white transition-all duration-200 active:scale-[0.98]"
                style={{ backgroundColor: "#ff5900" }}
              >
                <span>Find a ride</span>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
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
            )}
          </div>
        </div>
      </div>

      {/* ── Vehicle panel ── */}
      <div
        ref={vehiclePanelRef}
        className="fixed bottom-0 left-0 right-0 bg-white z-30 rounded-t-3xl shadow-2xl translate-y-full"
        style={{ maxHeight: "75vh", overflowY: "auto" }}
      >
        <div className="h-1 w-full bg-[#ff5900] rounded-t-3xl" />
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />
        <VehiclePanel
          setVehiclePanel={setVehiclePanel}
          setConfirmRidePanel={setConfirmRidePanel}
          onVehicleSelect={(v) => setSelectedVehicle(v)}
          pickup={pickupLocation}
          destination={destinationLocation}
        />
      </div>

      {/* ── Confirm ride panel ── */}
      <div
        ref={confirmRidePanelRef}
        className="fixed bottom-0 left-0 right-0 bg-white z-30 rounded-t-3xl shadow-2xl translate-y-full"
        style={{ maxHeight: "75vh", overflowY: "auto" }}
      >
        <div className="h-1 w-full bg-[#ff5900] rounded-t-3xl" />
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />
        <ConfirmRide
          vehicle={selectedVehicle}
          pickup={pickupLocation}
          destination={destinationLocation}
          onConfirm={handleRideConfirmed}
          onBack={() => {
            setConfirmRidePanel(false);
            setVehiclePanel(true);
          }}
        />
      </div>

      {/* ── Searching state ── */}
      {rideState === RIDE_STATE.SEARCHING && (
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <WaitingForDriver
            pickup={pickupLocation}
            destination={destinationLocation}
            onCancel={handleCancelRide}
          />
        </div>
      )}

      {/* ── Driver accepted state ── */}
      {rideState === RIDE_STATE.DRIVER_ACCEPTED && (
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <DriverAccepted
            driver={acceptedDriver}
            pickup={pickupLocation}
            destination={destinationLocation}
            onCancel={handleCancelRide}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
