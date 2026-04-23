/**
 * LocationInput.jsx  —  Frontend/src/components/LocationInput.jsx
 *
 * Redesigned with:
 *  • Debounced Nominatim search (400ms)
 *  • Keyboard navigation (↑↓ arrows, Enter, Esc)
 *  • "Use my location" button (browser GPS → reverse geocode)
 *  • Clear button
 *  • Loading spinner
 *  • Scrollable result dropdown with proper z-index
 *  • Pure Tailwind styling
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { searchLocation, reverseGeocode } from "../utils/mapUtils";

export default function LocationInput({
  label,
  value,
  onChange,
  onSelect,
  accentColor = "#ff5900",
  placeholder,
  showMyLocation = false,
}) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [locating, setLocating] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Sync external value changes (e.g. clear from parent)
  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setResults([]);
        setFocused(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = useCallback(
    (e) => {
      const q = e.target.value;
      setQuery(q);
      onChange?.(null);
      setActiveIdx(-1);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (q.length < 3) {
        setResults([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await searchLocation(q);
          setResults(res);
        } catch {
          setResults([]);
        }
        setLoading(false);
      }, 400);
    },
    [onChange],
  );

  const handleSelect = useCallback(
    (place) => {
      const loc = {
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        label: place.display_name.split(",").slice(0, 2).join(",").trim(),
        display_name: place.display_name,
      };
      setQuery(loc.label);
      setResults([]);
      setFocused(false);
      setActiveIdx(-1);
      onSelect(loc);
    },
    [onSelect],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    onChange?.(null);
    onSelect(null);
    inputRef.current?.focus();
  }, [onChange, onSelect]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(results[activeIdx]);
    } else if (e.key === "Escape") {
      setResults([]);
      setFocused(false);
      setActiveIdx(-1);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const item = listRef.current.children[activeIdx];
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  // "Use my location" — browser GPS + reverse geocode
  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const data = await reverseGeocode(coords.latitude, coords.longitude);
          const loc = {
            lat: coords.latitude,
            lon: coords.longitude,
            label:
              data.display_name?.split(",").slice(0, 2).join(",").trim() ??
              "My Location",
            display_name: data.display_name,
          };
          setQuery(loc.label);
          onSelect(loc);
        } catch {
          /* silent */
        }
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [onSelect]);

  const showDropdown = focused && results.length > 0;
  const isAccentOrange = accentColor === "#ff5900";

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* ── Input field ── */}
      <div
        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-200"
        style={{
          background: focused ? "#ffffff" : "#f9fafb",
          border: `1.5px solid ${focused ? accentColor : "#e5e7eb"}`,
          boxShadow: focused ? `0 0 0 3px ${accentColor}1a` : "none",
        }}
      >
        {/* Dot */}
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: accentColor }}
        />

        <div className="flex-1 min-w-0">
          <p
            className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: accentColor }}
          >
            {label}
          </p>
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? `Search ${label.toLowerCase()}…`}
            className="w-full bg-transparent border-none outline-none text-gray-900 text-[13px] placeholder:text-gray-300 leading-tight"
            autoComplete="off"
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {loading && (
            <div
              className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
              style={{
                borderColor: `${accentColor}60`,
                borderTopColor: "transparent",
              }}
            />
          )}

          {showMyLocation && !loading && !query && (
            <button
              onClick={handleMyLocation}
              disabled={locating}
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
              title="Use my location"
            >
              {locating ? (
                <div className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" fill="#3b82f6" />
                  <path
                    d="M12 2v3M12 19v3M2 12h3M19 12h3"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="7"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.4"
                  />
                </svg>
              )}
            </button>
          )}

          {query && !loading && (
            <button
              onClick={handleClear}
              className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path
                  d="M1 1l8 8M9 1L1 9"
                  stroke="#9ca3af"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Results dropdown ── */}
      {showDropdown && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 bg-white rounded-2xl overflow-hidden border border-gray-100"
          style={{
            top: "calc(100% + 6px)",
            zIndex: 9999,
            maxHeight: 280,
            overflowY: "auto",
            boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          }}
        >
          {results.map((r, i) => {
            const parts = r.display_name.split(",");
            const main = parts.slice(0, 2).join(",").trim();
            const sub = parts.slice(2, 4).join(",").trim();
            const isActive = i === activeIdx;

            return (
              <div
                key={i}
                onMouseDown={() => handleSelect(r)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${
                  isActive ? "bg-orange-50" : "hover:bg-gray-50"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${accentColor}15` }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                      fill={accentColor}
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">
                    {main}
                  </p>
                  {sub && (
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {sub}
                    </p>
                  )}
                </div>
                {isActive && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    className="shrink-0 mt-0.5"
                    fill="none"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke={accentColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
