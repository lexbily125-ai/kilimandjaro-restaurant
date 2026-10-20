import React from "react";
import { RESTAURANT_INFO } from "@/data/menu";

function StatBadge({ value, label }) {
  return (
    <div className="rounded-xl p-6 text-center k-card">
      <p className="font-heading text-4xl font-extrabold" style={{ color: "var(--k-gold)" }}>
        {value}
      </p>
      <p className="mt-2 text-xs uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>{label}</p>
    </div>
  );
}

export default function OurStory({ image }) {
  return (
    <section id="story" className="k-surface" style={{ borderTop: "1px solid var(--k-line)" }}>
      <div className="k-container py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--k-gold)" }}>
              Our Heritage
            </p>
            <h2
              className="font-heading text-3xl sm:text-5xl font-extrabold uppercase text-balance"
              style={{ color: "var(--k-silk)", letterSpacing: "-0.02em" }}
            >
              The Heritage of Kilimandjaro
            </h2>
            <p className="mt-6 text-base" style={{ color: "var(--k-muted)", lineHeight: 1.8 }}>
              Founded by chef {RESTAURANT_INFO.owner}, Kilimandjaro has been the cornerstone of West African
              culinary traditions in Philadelphia since {RESTAURANT_INFO.foundedYear}. Reopened in our
              flagship location at 4301 Chestnut St, we prepare traditional Senegalese dishes cooked daily
              with fresh ingredients, authentic spices, and time-honored recipes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <StatBadge value={`${new Date().getFullYear() - RESTAURANT_INFO.foundedYear}+`} label="Years Serving Philly" />
            <StatBadge value={`${RESTAURANT_INFO.rating}/5.0`} label="Google Rating" />
            <StatBadge value="100%" label="Made In-House" />
          </div>
        </div>
      </div>
    </section>
  );
}