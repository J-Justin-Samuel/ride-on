/**
 * useDriverAnimation.js  —  Frontend/src/hooks/useDriverAnimation.js
 * Smoothly animates a Leaflet marker between GPS updates using rAF lerp.
 * Works with live socket updates AND simulation ticks.
 */

import { useRef, useEffect } from "react";

/**
 * @param {import("leaflet").Marker | null} marker  - the Leaflet marker to animate
 * @param {{ lat: number, lon: number } | null} targetPosition - new GPS position
 * @param {number} durationMs - animation duration in ms (default 800)
 */
export function useDriverAnimation(marker, targetPosition, durationMs = 800) {
  const animRef = useRef(null);
  const fromRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!marker || !targetPosition) return;

    const current = marker.getLatLng();
    fromRef.current = { lat: current.lat, lon: current.lng };
    startRef.current = performance.now();

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const animate = (now) => {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);

      const lat =
        fromRef.current.lat +
        (targetPosition.lat - fromRef.current.lat) * eased;
      const lon =
        fromRef.current.lon +
        (targetPosition.lon - fromRef.current.lon) * eased;

      marker.setLatLng([lat, lon]);

      if (t < 1) animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [marker, targetPosition?.lat, targetPosition?.lon, durationMs]);
}
