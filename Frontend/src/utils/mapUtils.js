/**
 * mapUtils.js  —  Frontend/src/utils/mapUtils.js
 * All map utilities: geocoding (Nominatim), routing (OSRM), fare, time estimation.
 * No API key required — all free/open services.
 */

// ─── Distance calculation (Haversine formula) ──────────────────────────────
export function haversine(lat1, lon1, lat2, lon2) {
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

// ─── Fare estimation ────────────────────────────────────────────────────────
export function estimateFare(km, type) {
  const base = { UberX: 2.5, Comfort: 4.0, Black: 7.0, XL: 5.5 };
  const perKm = { UberX: 1.2, Comfort: 1.8, Black: 3.0, XL: 2.2 };
  return (base[type] + perKm[type] * km).toFixed(2);
}

// ─── Travel time estimation ─────────────────────────────────────────────────
export function estimateTime(km) {
  const mins = Math.round((km / 30) * 60);
  return mins < 1 ? "< 1 min" : `${mins} min`;
}

// ─── Nominatim forward geocoding (place search) ─────────────────────────────
export async function searchLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "en", "User-Agent": "RideOn-App/1.0" },
  });
  return res.json();
}

// ─── Nominatim reverse geocoding ────────────────────────────────────────────
export async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "en", "User-Agent": "RideOn-App/1.0" },
  });
  return res.json();
}

// ─── OSRM route fetching ─────────────────────────────────────────────────────
// Returns: { coordinates: [[lon,lat], ...], distanceKm, durationText }
export async function fetchRoute(pickup, dropoff) {
  const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${dropoff.lon},${dropoff.lat}?overview=full&geometries=geojson&steps=false`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.code !== "Ok" || !data.routes?.[0]) {
    throw new Error("OSRM route not found");
  }

  const route = data.routes[0];
  const coords = route.geometry.coordinates; // [[lon,lat], ...]
  const distanceKm = (route.distance / 1000).toFixed(1);
  const mins = Math.round(route.duration / 60);
  const durationText = mins < 1 ? "< 1 min" : `${mins} min`;

  // Convert to leaflet-friendly [lat, lon] pairs
  const latLons = coords.map(([lon, lat]) => [lat, lon]);

  return { latLons, distanceKm, durationText };
}

// ─── Interpolate a position along a polyline (0..1) ────────────────────────
// Used for smooth driver simulation along a real route
export function interpolateAlongRoute(latLons, progress) {
  if (!latLons || latLons.length < 2) return latLons?.[0] ?? [0, 0];
  if (progress <= 0) return latLons[0];
  if (progress >= 1) return latLons[latLons.length - 1];

  // Calculate cumulative segment lengths
  const segLengths = [];
  let total = 0;
  for (let i = 0; i < latLons.length - 1; i++) {
    const d = haversine(
      latLons[i][0],
      latLons[i][1],
      latLons[i + 1][0],
      latLons[i + 1][1],
    );
    segLengths.push(d);
    total += d;
  }

  const target = total * progress;
  let accumulated = 0;

  for (let i = 0; i < segLengths.length; i++) {
    if (accumulated + segLengths[i] >= target) {
      const t = (target - accumulated) / segLengths[i];
      const lat = latLons[i][0] + (latLons[i + 1][0] - latLons[i][0]) * t;
      const lon = latLons[i][1] + (latLons[i + 1][1] - latLons[i][1]) * t;
      return [lat, lon];
    }
    accumulated += segLengths[i];
  }

  return latLons[latLons.length - 1];
}
