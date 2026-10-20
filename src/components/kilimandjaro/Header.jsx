import React from "react";
import { Link } from "react-router-dom";
import { RESTAURANT_INFO } from "@/data/menu";
import { useAuth } from "@/lib/AuthContext";
import { User as UserIcon } from "lucide-react";
import ProfileBadge from "./ProfileBadge";

const NAV_LINKS = [
  { label: "Menu", target: "menu" },
  { label: "Our Story", target: "story" },
  { label: "Reviews", target: "reviews" },
  { label: "Hours", target: "location" },
];

export default function Header({ cartCount, onOpenCart }) {
  const telHref = `tel:${RESTAURANT_INFO.phone.replace(/[^0-9+]/g, "")}`;
  const { isAuthenticated } = useAuth();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D0C0A]/95 backdrop-blur-md" style={{ borderBottom: "1px solid var(--k-line)" }}>
      <div className="k-container">
        <div className="flex h-[72px] items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            aria-label="Kilimandjaro Restaurant — home"
            className="k-focus rounded-sm shrink-0"
          >
            <span
              className="block font-heading text-lg font-extrabold uppercase leading-none"
              style={{ color: "var(--k-silk)", letterSpacing: "-0.02em" }}
            >
              KILIMANDJARO
            </span>
            <span
              className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.3em]"
              style={{ color: "var(--k-gold)" }}
            >
              Heritage Kitchen
            </span>
          </Link>

          {/* Center nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Section navigation">
            {NAV_LINKS.map((link) => (
              <button
                key={link.target}
                onClick={() => scrollTo(link.target)}
                className="k-focus rounded-md px-3.5 py-2 text-sm font-semibold uppercase tracking-wide transition-colors"
                style={{ color: "var(--k-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--k-silk)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--k-muted)")}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={telHref}
              aria-label={`Call restaurant at ${RESTAURANT_INFO.phone}`}
              className="k-focus inline-flex h-10 items-center gap-2 rounded-full px-3 sm:px-4 text-sm font-bold transition-colors k-glass-pill"
              style={{ color: "var(--k-silk)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--k-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="hidden sm:inline">{RESTAURANT_INFO.phone}</span>
            </a>
            <a
              href={RESTAURANT_INFO.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Facebook page"
              className="k-focus hidden h-10 w-10 items-center justify-center rounded-full transition-colors k-glass-pill md:flex"
              style={{ color: "var(--k-silk)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.063 24 12.073z" />
              </svg>
            </a>
            <a
              href={RESTAURANT_INFO.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Instagram page"
              className="k-focus hidden h-10 w-10 items-center justify-center rounded-full transition-colors k-glass-pill md:flex"
              style={{ color: "var(--k-silk)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            {isAuthenticated ? (
              <ProfileBadge />
            ) : (
              <>
              <Link
                to="/login"
                aria-label="Account — sign in"
                className="k-focus flex h-10 w-10 items-center justify-center rounded-full transition-colors k-glass-pill sm:hidden"
                style={{ color: "var(--k-silk)" }}
              >
                <UserIcon className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                aria-label="Sign in or register"
                className="k-focus hidden sm:inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-xs font-bold uppercase tracking-wide transition-transform hover:scale-[1.02] k-glass-pill"
                style={{ color: "var(--k-silk)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--k-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Sign In
              </Link>
              </>
            )}
            <button
              onClick={onOpenCart}
              aria-label="Open cart"
              className="k-focus relative flex h-10 w-10 items-center justify-center rounded-full transition-colors k-glass-pill"
              style={{ color: "var(--k-silk)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] font-bold"
                  style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}