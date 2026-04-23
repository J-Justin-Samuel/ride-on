const NOTIFY_RADIUS_KM = 5;

const activeUsers = new Map(); // userId  → socketId
const activeDrivers = new Map(); // driverId → { socketId, location, available }

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const socketService = (io) => {
  io.on("connection", (socket) => {
    const { userId, role } = socket.handshake.auth;

    if (!userId || !role) {
      console.warn(
        `⚠️  Socket connected WITHOUT auth — socket ${socket.id} — disconnecting`,
      );
      socket.disconnect();
      return;
    }

    console.log(
      `\n🔌 Connected: [${role}] userId="${userId}" socket="${socket.id}"`,
    );

    // ── Register ────────────────────────────────────────────────────────────
    if (role === "passenger") {
      activeUsers.set(userId, socket.id);
      console.log(
        `   ✅ Registered passenger. Total passengers: ${activeUsers.size}`,
      );
    }

    if (role === "driver") {
      activeDrivers.set(userId, {
        socketId: socket.id,
        location: null,
        available: true,
      });
      console.log(
        `   ✅ Registered driver. Total drivers: ${activeDrivers.size}`,
      );
    }

    // ── Driver: update GPS location ─────────────────────────────────────────
    socket.on("updateLocation", ({ lat, lon }) => {
      if (role !== "driver") return;
      const driver = activeDrivers.get(userId);
      if (driver) {
        activeDrivers.set(userId, { ...driver, location: { lat, lon } });
        console.log(`📍 Driver ${userId} location updated: ${lat}, ${lon}`);
      }
    });

    // ── Passenger: request ride ─────────────────────────────────────────────
    socket.on("requestRide", (rideData) => {
      console.log(`\n🚗 RIDE REQUEST from passenger "${userId}"`);
      console.log(
        `   Pickup: lat=${rideData.pickup?.lat} lon=${rideData.pickup?.lon}`,
      );
      console.log(`   Active drivers registered: ${activeDrivers.size}`);

      if (activeDrivers.size === 0) {
        console.log("   ❌ No drivers connected at all");
        socket.emit("noDriversAvailable", {
          message: "No drivers online right now. Please try again.",
        });
        return;
      }

      // Log all drivers for debugging
      activeDrivers.forEach((driver, id) => {
        console.log(
          `   👤 Driver "${id}": available=${driver.available}, location=${JSON.stringify(driver.location)}, socket=${driver.socketId}`,
        );
      });

      const pickupLat = rideData.pickup?.lat;
      const pickupLon = rideData.pickup?.lon;

      const nearbyDrivers = [...activeDrivers.entries()].filter(
        ([driverId, driver]) => {
          if (!driver.available) {
            console.log(`   ⛔ Driver "${driverId}" is not available`);
            return false;
          }

          // No GPS yet → include as fallback (they just went online)
          if (!driver.location || !pickupLat || !pickupLon) {
            console.log(
              `   ⚠️  Driver "${driverId}" has no location — including as fallback`,
            );
            return true;
          }

          const dist = getDistanceKm(
            pickupLat,
            pickupLon,
            driver.location.lat,
            driver.location.lon,
          );
          const inRange = dist <= NOTIFY_RADIUS_KM;
          console.log(
            `   📏 Driver "${driverId}" is ${dist.toFixed(2)} km away — ${inRange ? "IN RANGE ✅" : "TOO FAR ❌"}`,
          );
          return inRange;
        },
      );

      if (nearbyDrivers.length === 0) {
        console.log(
          `   ❌ No nearby drivers found within ${NOTIFY_RADIUS_KM} km`,
        );
        socket.emit("noDriversAvailable", {
          message: `No drivers available within ${NOTIFY_RADIUS_KM} km. Try again shortly.`,
        });
        return;
      }

      const rideId = `ride_${Date.now()}`;
      console.log(
        `   📢 Notifying ${nearbyDrivers.length} driver(s) — rideId: ${rideId}`,
      );

      nearbyDrivers.forEach(([driverId, driver]) => {
        io.to(driver.socketId).emit("newRideRequest", {
          rideId,
          passengerId: userId,
          passengerSocketId: socket.id,
          ...rideData,
        });
        console.log(
          `   → Sent to driver "${driverId}" (socket: ${driver.socketId})`,
        );
      });
    });

    // ── Driver: accept ride ─────────────────────────────────────────────────
    socket.on("acceptRide", (payload) => {
      const { passengerSocketId, rideId, ...driverDetails } = payload;
      console.log(`\n✅ Driver "${userId}" accepted ride "${rideId}"`);
      console.log(`   Notifying passenger socket: ${passengerSocketId}`);

      const driver = activeDrivers.get(userId);
      if (driver) {
        activeDrivers.set(userId, { ...driver, available: false });
      }

      io.to(passengerSocketId).emit("driverAccepted", {
        rideId,
        driver: { id: userId, socketId: socket.id, ...driverDetails },
      });

      socket.broadcast.emit("rideTaken", { rideId });
    });

    // ── Driver: stream location to passenger ────────────────────────────────
    socket.on("driverLiveLocation", ({ passengerSocketId, lat, lon }) => {
      io.to(passengerSocketId).emit("driverLocation", { lat, lon });
    });

    // ── Passenger: cancel ride ──────────────────────────────────────────────
    socket.on("cancelRide", ({ rideId }) => {
      console.log(`\n❌ Ride "${rideId}" cancelled by passenger "${userId}"`);
      activeDrivers.forEach((driver) => {
        io.to(driver.socketId).emit("rideCancelled", { rideId });
      });
    });

    socket.on("passengerPickedUp", ({ rideId, passengerSocketId }) => {
      io.to(passengerSocketId).emit("passengerPickedUp", { rideId });
    });

    // ── Driver: complete ride ───────────────────────────────────────────────
    socket.on("completeRide", ({ rideId, passengerSocketId }) => {
      console.log(`\n🏁 Ride "${rideId}" completed by driver "${userId}"`);
      const driver = activeDrivers.get(userId);
      if (driver) activeDrivers.set(userId, { ...driver, available: true });
      io.to(passengerSocketId).emit("rideCompleted", { rideId });
    });

    // ── Disconnect ──────────────────────────────────────────────────────────
    socket.on("disconnect", (reason) => {
      if (role === "passenger") activeUsers.delete(userId);
      if (role === "driver") activeDrivers.delete(userId);
      console.log(
        `\n🔌 Disconnected: [${role}] "${userId}" — reason: ${reason}`,
      );
      console.log(
        `   Active passengers: ${activeUsers.size} | Active drivers: ${activeDrivers.size}`,
      );
    });
  });
};

export const getActiveDriverCount = () =>
  [...activeDrivers.values()].filter((d) => d.available).length;
