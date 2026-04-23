import React, { useEffect, useRef, useCallback, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  fetchRoute,
  haversine,
  interpolateAlongRoute,
} from "../utils/mapUtils";
import { useDriverAnimation } from "../hooks/useDriverAnimation";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// SVG icon factory
function makePinIcon(bgColor, svgInner, size = 38) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;height:${size}px;
        background:${bgColor};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid rgba(255,255,255,0.95);
        box-shadow:0 4px 20px rgba(0,0,0,0.4);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;">
          ${svgInner}
        </span>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size - 4],
  });
}

function makeCarIcon(heading = 0) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:44px;height:44px;
        display:flex;align-items:center;justify-content:center;
        transform:rotate(${heading}deg);
        filter:drop-shadow(0 4px 12px rgba(0,0,0,0.5));
        transition:transform 0.4s ease;
      ">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="22" r="20" fill="#f59e0b" stroke="white" stroke-width="2.5"/>
          <path d="M28.5 17.5C28.2 16.6 27.4 16 26.5 16h-9c-.9 0-1.7.6-2 1.5L14 21v6c0 .6.4 1 1 1h1c.6 0 1-.4 1-1v-1h10v1c0 .6.4 1 1 1h1c.6 0 1-.4 1-1v-6l-1.5-3.5zM17.5 24c-.8 0-1.5-.7-1.5-1.5S16.7 21 17.5 21s1.5.7 1.5 1.5S18.3 24 17.5 24zm9 0c-.8 0-1.5-.7-1.5-1.5S25.7 21 26.5 21s1.5.7 1.5 1.5S27.3 24 26.5 24zM16 20l1.5-3h9l1.5 3H16z" fill="white"/>
        </svg>
      </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

const ICONS = {
  pickup: makePinIcon(
    "#ff5900",
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="white">
       <circle cx="12" cy="10" r="3"/>
       <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" opacity="0.4"/>
     </svg>`,
  ),
  dropoff: makePinIcon(
    "#023341",
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="white">
       <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
     </svg>`,
  ),
  user: makePinIcon(
    "#3b82f6",
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="white">
       <circle cx="12" cy="8" r="3"/>
       <path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
     </svg>`,
  ),
};

//  MapView Component
export default function MapView({
  pickup,
  dropoff,
  userLocation,
  driverLocations = [],
  onMapClick,
  mapCenter,
  zoom = 14,
  // Simulation props
  simulateDriver = false,
  simulationSpeed = 1, // 1x, 2x, 4x
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const pickupMarker = useRef(null);
  const dropoffMarker = useRef(null);
  const userMarker = useRef(null);
  const driverMarker = useRef(null);
  const routeLayer = useRef(null);
  const distBadge = useRef(null);
  const pulseLayer = useRef(null);
  const simRef = useRef({ raf: null, progress: 0, route: null });

  //  Live driver target for smooth animation
  const [driverTarget, setDriverTarget] = useState(null);
  useDriverAnimation(driverMarker.current, driverTarget);

  // Init Leaflet map
  useEffect(() => {
    if (mapRef.current) return;

    const center = mapCenter
      ? [mapCenter.lat, mapCenter.lon ?? mapCenter.lng]
      : [12.9716, 77.5946];

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: true,
    });

    // CARTO dark tiles — no API key needed
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '© <a href="https://carto.com/">CARTO</a> © <a href="https://openstreetmap.org">OSM</a>',
        maxZoom: 19,
        subdomains: "abcd",
      },
    ).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    map.on("click", (e) => {
      onMapClick?.({ lat: e.latlng.lat, lon: e.latlng.lng });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-center smoothly
  useEffect(() => {
    if (!mapRef.current || !mapCenter?.lat) return;
    mapRef.current.panTo([mapCenter.lat, mapCenter.lon ?? mapCenter.lng], {
      animate: true,
      duration: 0.8,
    });
  }, [mapCenter?.lat, mapCenter?.lon]);

  //Pickup marker
  useEffect(() => {
    if (!mapRef.current) return;
    pickupMarker.current?.remove();
    pickupMarker.current = null;
    if (pickup?.lat && pickup?.lon) {
      pickupMarker.current = L.marker([pickup.lat, pickup.lon], {
        icon: ICONS.pickup,
      })
        .addTo(mapRef.current)
        .bindPopup(
          `<b style="color:#ff5900">Pickup</b><br>
           <span style="font-size:11px;color:#aaa">${pickup.label || pickup.display_name || ""}</span>`,
        );
    }
    drawRoute();
  }, [pickup?.lat, pickup?.lon]);

  // ── Dropoff marker ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    dropoffMarker.current?.remove();
    dropoffMarker.current = null;
    if (dropoff?.lat && dropoff?.lon) {
      dropoffMarker.current = L.marker([dropoff.lat, dropoff.lon], {
        icon: ICONS.dropoff,
      })
        .addTo(mapRef.current)
        .bindPopup(
          `<b style="color:#023341">Drop-off</b><br>
           <span style="font-size:11px;color:#aaa">${dropoff.label || dropoff.display_name || ""}</span>`,
        );
    }
    drawRoute();
  }, [dropoff?.lat, dropoff?.lon]);

  // ── User / passenger marker ────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    userMarker.current?.remove();
    userMarker.current = null;
    if (userLocation?.lat && userLocation?.lon) {
      userMarker.current = L.marker([userLocation.lat, userLocation.lon], {
        icon: ICONS.user,
      }).addTo(mapRef.current);
    }
  }, [userLocation?.lat, userLocation?.lon]);

  // ── Live driver markers (from socket) ────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || simulateDriver) return;

    const d = driverLocations[0];
    if (!d?.lat) {
      driverMarker.current?.remove();
      driverMarker.current = null;
      return;
    }

    if (!driverMarker.current) {
      driverMarker.current = L.marker([d.lat, d.lon ?? d.lng], {
        icon: makeCarIcon(0),
      }).addTo(mapRef.current);
    }

    // Set target — the useDriverAnimation hook handles smooth interpolation
    setDriverTarget({ lat: d.lat, lon: d.lon ?? d.lng });
  }, [driverLocations[0]?.lat, driverLocations[0]?.lon, simulateDriver]);

  // ── Route drawing via OSRM ────────────────────────────────────────────
  const drawRoute = useCallback(async () => {
    if (!mapRef.current) return;

    // Remove old route
    routeLayer.current?.remove();
    distBadge.current?.remove();
    pulseLayer.current?.remove();
    routeLayer.current = null;
    distBadge.current = null;
    pulseLayer.current = null;
    simRef.current.route = null;

    if (!(pickup?.lat && pickup?.lon && dropoff?.lat && dropoff?.lon)) return;

    try {
      const { latLons, distanceKm, durationText } = await fetchRoute(
        pickup,
        dropoff,
      );

      if (!mapRef.current) return; // unmounted

      // Store route for simulation
      simRef.current.route = latLons;

      // Draw solid route line
      routeLayer.current = L.polyline(latLons, {
        color: "#ff5900",
        weight: 4,
        opacity: 0.9,
        lineCap: "round",
      }).addTo(mapRef.current);

      // Draw subtle ghost trail behind route
      L.polyline(latLons, {
        color: "#ff5900",
        weight: 10,
        opacity: 0.12,
        lineCap: "round",
      }).addTo(mapRef.current);

      // Distance + ETA badge at the midpoint
      const mid = latLons[Math.floor(latLons.length / 2)];
      distBadge.current = L.marker(mid, {
        icon: L.divIcon({
          className: "",
          html: `
            <div style="
              background:#ff5900;
              color:white;
              font-size:11px;
              font-weight:700;
              padding:5px 13px;
              border-radius:20px;
              white-space:nowrap;
              box-shadow:0 4px 16px rgba(255,89,0,0.45);
              font-family:monospace;
              letter-spacing:0.04em;
              border:2px solid rgba(255,255,255,0.25);
            ">${distanceKm} km · ${durationText}</div>`,
          iconAnchor: [55, 14],
        }),
        interactive: false,
      }).addTo(mapRef.current);

      // Fit map to both pins with padding for UI panels
      mapRef.current.fitBounds(
        L.latLngBounds([pickup.lat, pickup.lon], [dropoff.lat, dropoff.lon]),
        { padding: [80, 80], animate: true, duration: 0.8 },
      );

      // Auto-start simulation if enabled
      if (simulateDriver) {
        startSimulation(latLons);
      }
    } catch (err) {
      console.warn("Route fetch failed, falling back to straight line:", err);
      // Straight-line fallback
      if (!mapRef.current) return;
      const latLons = [
        [pickup.lat, pickup.lon],
        [dropoff.lat, dropoff.lon],
      ];
      routeLayer.current = L.polyline(latLons, {
        color: "#ff5900",
        weight: 4,
        opacity: 0.9,
        dashArray: "10 6",
      }).addTo(mapRef.current);
      simRef.current.route = latLons;
      if (simulateDriver) startSimulation(latLons);
    }
  }, [pickup, dropoff, simulateDriver, simulationSpeed]);

  useEffect(() => {
    drawRoute();
  }, [drawRoute]);

  // ── Driver simulation along route ─────────────────────────────────────
  const startSimulation = useCallback(
    (latLons) => {
      if (!mapRef.current || !latLons?.length) return;

      // Cancel existing simulation
      if (simRef.current.raf) cancelAnimationFrame(simRef.current.raf);
      simRef.current.progress = 0;

      // Create driver marker at start
      driverMarker.current?.remove();
      driverMarker.current = L.marker(latLons[0], {
        icon: makeCarIcon(0),
      }).addTo(mapRef.current);

      const SPEED = 0.000035 * simulationSpeed; // progress units per frame (~30km/h at 1x)
      let prevPos = latLons[0];

      const tick = () => {
        simRef.current.progress = Math.min(simRef.current.progress + SPEED, 1);
        const pos = interpolateAlongRoute(latLons, simRef.current.progress);

        // Calculate heading for car rotation
        const dLat = pos[0] - prevPos[0];
        const dLon = pos[1] - prevPos[1];
        const heading = (Math.atan2(dLon, dLat) * 180) / Math.PI;
        prevPos = pos;

        if (driverMarker.current) {
          driverMarker.current.setLatLng(pos);
          driverMarker.current.setIcon(makeCarIcon(heading));
        }

        // Broadcast simulated position via callback
        setDriverTarget({ lat: pos[0], lon: pos[1] });

        if (simRef.current.progress < 1) {
          simRef.current.raf = requestAnimationFrame(tick);
        }
      };

      simRef.current.raf = requestAnimationFrame(tick);
    },
    [simulationSpeed],
  );

  // Restart simulation when speed changes
  useEffect(() => {
    if (simulateDriver && simRef.current.route) {
      startSimulation(simRef.current.route);
    }
  }, [simulationSpeed, simulateDriver]);

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simRef.current.raf) cancelAnimationFrame(simRef.current.raf);
    };
  }, []);

  // ── Hint overlay ──────────────────────────────────────────────────────
  const hint = !pickup
    ? "Search for a pickup location"
    : !dropoff
      ? "Search for a drop-off"
      : null;

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {hint && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <div className="bg-black/75 backdrop-blur-sm text-white text-xs font-bold px-5 py-2.5 rounded-full whitespace-nowrap border border-white/10 shadow-xl tracking-wide">
            {hint}
          </div>
        </div>
      )}

      <style>{`
        .leaflet-container { background: #0f0f1a; }
        .leaflet-popup-content-wrapper {
          background: #1c1c2e;
          color: #e2e8f0;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.7);
        }
        .leaflet-popup-tip { background: #1c1c2e; }
        .leaflet-popup-content { margin: 10px 14px; font-size: 12px; line-height: 1.6; }
        .leaflet-popup-close-button { color: #555 !important; }
        .leaflet-control-zoom {
          border: none !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
        }
        .leaflet-control-zoom a {
          background: #1c1c2e !important;
          color: #94a3b8 !important;
          border: none !important;
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
          transition: all 0.15s;
        }
        .leaflet-control-zoom a:last-child { border-bottom: none !important; }
        .leaflet-control-zoom a:hover { background: #ff5900 !important; color: white !important; }
        .leaflet-control-attribution {
          background: rgba(0,0,0,0.55) !important;
          color: #444 !important;
          font-size: 9px !important;
          border-radius: 8px 0 0 0 !important;
          padding: 2px 7px !important;
        }
        .leaflet-control-attribution a { color: #555 !important; }
      `}</style>
    </div>
  );
}
