import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RESTAURANT_INFO } from "@/data/menu";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const POSITION = [39.9577, -75.2034];

const markerIcon = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#E0B034;border:3px solid #0D0C0A;box-shadow:0 0 12px rgba(224,176,52,0.7);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function fmtTime(t) {
  const [h, m] = (t || "11:00").split(":");
  const hr = parseInt(h, 10);
  const ampm = hr >= 12 ? "PM" : "AM";
  const hr12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return `${hr12}:${m || "00"} ${ampm}`;
}

export default function LocationHours() {
  const { settings } = useStoreSettings();
  const telHref = `tel:${RESTAURANT_INFO.phone.replace(/[^0-9+]/g, "")}`;

  const open = settings?.open_time || "11:00";
  const weekdayClose = settings?.close_time || "22:00";
  const weekendClose = settings?.weekend_close_time || "23:00";

  const HOURS = [
    { day: "Monday", close: weekdayClose },
    { day: "Tuesday", close: weekdayClose },
    { day: "Wednesday", close: weekdayClose },
    { day: "Thursday", close: weekdayClose },
    { day: "Friday", close: weekendClose },
    { day: "Saturday", close: weekendClose },
    { day: "Sunday", close: weekdayClose },
  ];

  return (
    <section id="location" className="k-surface" style={{ borderTop: "1px solid var(--k-line)" }}>
      <div className="k-container py-16 sm:py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--k-gold)" }}>
          Visit Us
        </p>
        <h2
          className="font-heading text-3xl sm:text-4xl font-extrabold uppercase"
          style={{ color: "var(--k-silk)", letterSpacing: "-0.02em" }}
        >
          Hours, Contact & Location
        </h2>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* Left: details */}
          <div className="flex flex-col gap-5">
            <div className="k-card p-6">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wide" style={{ color: "var(--k-silk)" }}>Location</h3>
              <p className="mt-2 flex items-start gap-2" style={{ color: "var(--k-muted)", lineHeight: 1.6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--k-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {RESTAURANT_INFO.address}
              </p>
            </div>

            <div className="k-card p-6">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wide" style={{ color: "var(--k-silk)" }}>Phone</h3>
              <p className="mt-2 flex items-center gap-2" style={{ color: "var(--k-muted)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--k-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {RESTAURANT_INFO.phone}
              </p>
            </div>

            <div className="k-card p-6">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wide" style={{ color: "var(--k-silk)" }}>Operating Hours</h3>
              <ul className="mt-3 text-sm" style={{ borderColor: "var(--k-line)" }}>
                {HOURS.map((row, i) => (
                  <li
                    key={row.day}
                    className="flex items-center justify-between py-2.5"
                    style={i > 0 ? { borderTop: "1px solid var(--k-line)" } : undefined}
                  >
                    <span style={{ color: "var(--k-muted)" }}>{row.day}</span>
                    <span className="font-semibold" style={{ color: "var(--k-silk)" }}>
                      {fmtTime(open)} – {fmtTime(row.close)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={telHref}
                className="k-focus inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold uppercase tracking-wide transition-transform hover:scale-[1.02] active:scale-95"
                style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Call Restaurant
              </a>
              <a
                href={RESTAURANT_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="k-focus inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold uppercase tracking-wide transition-colors k-glass-pill"
                style={{ color: "var(--k-silk)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* Right: dark-filtered map */}
          <div className="overflow-hidden rounded-2xl k-card">
            <div style={{ filter: "invert(90%) hue-rotate(180deg)", height: "100%", minHeight: 460 }}>
              <MapContainer
                center={POSITION}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: "100%", minHeight: 460, width: "100%", background: "#0D0C0A" }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={POSITION} icon={markerIcon}>
                  <Popup>
                    <strong>{RESTAURANT_INFO.name}</strong>
                    <br />
                    {RESTAURANT_INFO.address}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}