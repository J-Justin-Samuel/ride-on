/**
 * rideSocket.js  (Frontend/src/utils/rideSocket.js)
 * Production-ready socket client for ride events.
 *
 * Install:  npm install socket.io-client   (run inside Frontend/)
 */

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

export const rideSocket = io(SOCKET_URL, {
  autoConnect: false, // we connect manually after we have userId
  transports: ["websocket"],
});

// ─────────────────────────────────────────────────────────────────────────────
// CONNECTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Connect to the socket server.
 * @param {string} userId  - logged-in user's ID
 * @param {"passenger"|"driver"} role
 */
export const connectSocket = (userId, role = "passenger") => {
  rideSocket.auth = { userId, role };
  if (!rideSocket.connected) rideSocket.connect();
};

export const disconnectSocket = () => rideSocket.disconnect();

// ─────────────────────────────────────────────────────────────────────────────
// PASSENGER SIDE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Emit a ride request to the server.
 * Server will broadcast to nearby available drivers.
 */
export const emitRideRequest = (rideData) => {
  rideSocket.emit("requestRide", rideData);
};

/**
 * Listen for driver acceptance.
 * @param {(driverData: object) => void} callback
 * @returns cleanup function
 */
export const onDriverAccepted = (callback) => {
  rideSocket.on("driverAccepted", callback);
  return () => rideSocket.off("driverAccepted", callback);
};

/**
 * Listen for no drivers available.
 * @param {(data: { message: string }) => void} callback
 * @returns cleanup function
 */
export const onNoDrivers = (callback) => {
  rideSocket.on("noDriversAvailable", callback);
  return () => rideSocket.off("noDriversAvailable", callback);
};

/**
 * Listen for live driver GPS while ride is in progress.
 * @param {({ lat, lon }) => void} callback
 * @returns cleanup function
 */
export const onDriverLocationUpdate = (callback) => {
  rideSocket.on("driverLocation", callback);
  return () => rideSocket.off("driverLocation", callback);
};

/**
 * Listen for ride completion.
 */
export const onRideCompleted = (callback) => {
  rideSocket.on("rideCompleted", callback);
  return () => rideSocket.off("rideCompleted", callback);
};

/** Cancel ride */
export const emitCancelRide = (rideId) => {
  rideSocket.emit("cancelRide", { rideId });
};

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER SIDE  (used in Driver app pages)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Listen for incoming ride requests (driver app).
 */
export const onNewRideRequest = (callback) => {
  rideSocket.on("newRideRequest", callback);
  return () => rideSocket.off("newRideRequest", callback);
};

/**
 * Accept a ride and send driver details to server.
 * @param {object} payload - { rideId, passengerSocketId, name, rating, vehicle, vehicleNumber, eta }
 */
export const emitDriverAccept = (payload) => {
  rideSocket.emit("acceptRide", payload);
};

/**
 * Broadcast driver GPS location to passenger during ride.
 */
export const emitDriverLiveLocation = ({ passengerSocketId, lat, lon }) => {
  rideSocket.emit("driverLiveLocation", { passengerSocketId, lat, lon });
};

/** Mark ride as complete */
export const emitCompleteRide = ({ rideId, passengerSocketId }) => {
  rideSocket.emit("completeRide", { rideId, passengerSocketId });
};

/** Emit GPS update (for driver's map marker) */
export const emitDriverLocation = (coords) => {
  rideSocket.emit("updateLocation", coords);
};

/** Listen for ride being taken by another driver */
export const onRideTaken = (callback) => {
  rideSocket.on("rideTaken", callback);
  return () => rideSocket.off("rideTaken", callback);
};

/** Listen for ride cancelled by passenger */
export const onRideCancelled = (callback) => {
  rideSocket.on("rideCancelled", callback);
  return () => rideSocket.off("rideCancelled", callback);
};

// Emit when captain confirms passenger is in the car
export const emitPassengerPickedUp = ({ rideId, passengerSocketId }) => {
  rideSocket.emit("passengerPickedUp", { rideId, passengerSocketId });
};

// Listen on the user side
export const onPassengerPickedUp = (cb) => {
  rideSocket.on("passengerPickedUp", cb);
  return () => rideSocket.off("passengerPickedUp", cb);
};
