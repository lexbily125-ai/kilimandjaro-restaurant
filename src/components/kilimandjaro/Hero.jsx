import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { RESTAURANT_INFO } from "@/data/menu";

function TrustStat({ icon, children }) {
  return (
    <div className="flex items-center gap-2.5 text-sm font-medium" style={{ color: "var(--k-silk)" }}>
      <span style={{ color: "var(--k-gold)" }}>{icon}</span>
      {children}
    </div>
  );
}

export default function Hero({ heroImage, featuredImage, onOrderPickup }) {
  const [liveImage, setLiveImage] = useState(null);

  // Query the live MenuItem dataset for the Thieboudienne dish (fuzzy match on
  // "thieboudi" to catch both "Thieboudienne" and "Thieboudiene" spellings).
  // Any image edit in Admin → Menu Management instantly updates this card.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await base44.entities.MenuItem.list("-created_date", 500);
        const match = (list || []).find((it) => /thieboudi/i.test(it.name || ""));
        if (active && match && match.image) setLiveImage(match.image);
      } catch {
        /* fall back to featuredImage / heroImage prop */
      }
    })();
    const unsub = base44.entities.MenuItem.subscribe((event) => {
      if (!active) return;
      if (event && event.data && /thieboudi/i.test(event.data.name || "")) {
        if (event.data.image) setLiveImage(event.data.image);
      }
    });
    return () => {
      active = false;
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const dishImage = liveImage || featuredImage || heroImage;

  return (
    <section className="relative k-surface overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        {heroImage && <img src={heroImage} alt="" aria-hidden="true" className="h-full w-full object-cover" />}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(13,12,10,0.7) 0%, rgba(13,12,10,0.92) 65%, #0D0C0A 100%)" }}
        />
      </div>

      <div className="relative k-container pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left column */}
          <div>
            <span
              className="inline-block rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] k-glass-pill"
              style={{ color: "var(--k-gold)" }}
            >
              West Philadelphia • University City
            </span>
            <h1
              className="mt-6 font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase text-balance"
              style={{ color: "var(--k-silk)", letterSpacing: "-0.02em", lineHeight: 1.05 }}
            >
              Authentic West African & Senegalese Cuisine
            </h1>
            <p className="mt-5 max-w-xl text-base" style={{ color: "var(--k-muted)", lineHeight: 1.7 }}>
              Handcrafted Thieboudienne, Grilled Tilapia, and Fresh Juices. Serving University City since {RESTAURANT_INFO.foundedYear}.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={onOrderPickup}
                className="k-focus inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-bold uppercase tracking-wide transition-transform hover:scale-[1.03] active:scale-95"
                style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--k-gold-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--k-gold)")}
              >
                Order Direct for Pickup
              </button>
              <a
                href={RESTAURANT_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="k-focus inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-bold uppercase tracking-wide transition-colors k-glass-pill"
                style={{ color: "var(--k-silk)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Get Directions
              </a>
            </div>
          </div>

          {/* Right column — featured dish card */}
          <div className="relative hidden lg:block">
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{ boxShadow: "0 0 0 1px var(--k-line), 0 0 40px rgba(224,176,52,0.18)" }}
            >
              {dishImage && (
                <img
                  src={dishImage}
                  alt="Featured Thieboudienne — West African signature dish"
                  className="aspect-[4/3] w-full object-cover"
                />
              )}
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(13,12,10,0) 45%, rgba(13,12,10,0.75) 100%)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span
                  className="inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                  style={{ backgroundColor: "var(--k-terracotta)", color: "var(--k-silk)" }}
                >
                  Signature Dish
                </span>
                <p className="mt-3 font-heading text-xl font-bold" style={{ color: "var(--k-silk)" }}>
                  Thieboudienne
                </p>
                <p className="text-sm" style={{ color: "var(--k-muted)" }}>Fish steamed with fresh vegetables over rice</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl px-6 py-5 k-glass-pill">
          <TrustStat
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.5L6 22l1.5-7.2L2 10l7.1-1.1L12 2z" />
              </svg>
            }
          >
            <strong style={{ color: "var(--k-silk)" }}>{RESTAURANT_INFO.rating} / 5.0</strong> · {RESTAURANT_INFO.reviewsCount} Google Reviews
          </TrustStat>
          <div className="hidden h-4 w-px sm:block" style={{ background: "var(--k-line)" }} />
          <TrustStat
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
          >
            {RESTAURANT_INFO.address}
          </TrustStat>
          <div className="hidden h-4 w-px sm:block" style={{ background: "var(--k-line)" }} />
          <TrustStat
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            }
          >
            100% Direct Order — No App Commissions
          </TrustStat>
        </div>
      </div>
    </section>
  );
}