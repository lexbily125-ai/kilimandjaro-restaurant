import React from "react";
import { Link } from "react-router-dom";
import { RESTAURANT_INFO } from "@/data/menu";

export default function Footer() {
  const telHref = `tel:${RESTAURANT_INFO.phone.replace(/[^0-9+]/g, "")}`;
  return (
    <footer className="k-surface" style={{ borderTop: "1px solid var(--k-line)" }}>
      <div className="k-container py-12">
        <div className="flex flex-col items-center text-center gap-6">
          <Link to="/" aria-label="Kilimandjaro Restaurant — home" className="k-focus">
            <p
              className="font-heading text-lg font-extrabold uppercase tracking-tight"
              style={{ color: "var(--k-silk)", letterSpacing: "-0.02em" }}
            >
              KILIMANDJARO
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em]" style={{ color: "var(--k-gold)" }}>
              West African Heritage Kitchen
            </p>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href={RESTAURANT_INFO.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Facebook page"
              className="k-focus flex h-10 w-10 items-center justify-center rounded-full transition-colors k-glass-pill"
              style={{ color: "var(--k-silk)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.063 24 12.073z" />
              </svg>
            </a>
            <a
              href={RESTAURANT_INFO.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Instagram page"
              className="k-focus flex h-10 w-10 items-center justify-center rounded-full transition-colors k-glass-pill"
              style={{ color: "var(--k-silk)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a
              href={telHref}
              aria-label={`Call us at ${RESTAURANT_INFO.phone}`}
              className="k-focus inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold transition-colors k-glass-pill"
              style={{ color: "var(--k-silk)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {RESTAURANT_INFO.phone}
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/"
              className="k-focus text-xs font-semibold transition-colors"
              style={{ color: "var(--k-muted)" }}
            >
              Home
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById("menu");
                if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
              }}
              className="k-focus text-xs font-semibold transition-colors"
              style={{ color: "var(--k-muted)" }}
            >
              Menu
            </button>
            <Link
              to="/orders"
              className="k-focus text-xs font-semibold transition-colors"
              style={{ color: "var(--k-muted)" }}
            >
              My Orders
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById("location");
                if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
              }}
              className="k-focus text-xs font-semibold transition-colors"
              style={{ color: "var(--k-muted)" }}
            >
              Location & Hours
            </button>
            <a
              href={`tel:${RESTAURANT_INFO.phone.replace(/[^0-9+]/g, "")}`}
              className="k-focus text-xs font-semibold transition-colors"
              style={{ color: "var(--k-muted)" }}
            >
              Contact
            </a>
          </div>

          <p className="text-xs" style={{ color: "var(--k-muted)" }}>
            © {new Date().getFullYear()} {RESTAURANT_INFO.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}