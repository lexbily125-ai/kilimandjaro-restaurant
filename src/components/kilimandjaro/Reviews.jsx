import React from "react";

const REVIEWS = [
  {
    quote:
      "Get the Red Snapper Poisson with athieke. Cooked to the perfect level of crisp while keeping the fish tasty and not overdone. Topped off with the bubbly Senegal Cocktail. Everything was delicious, chill atmosphere, and very friendly staff!",
    author: "Raquel Mangual",
  },
  {
    quote:
      "Never had Senegalese food before, this place was highly recommended! The food was delish esp that shrimp appetizer. I had the tilapia with Jollof rice — good portion size, well seasoned, and the ginger strawberry drink was very refreshing.",
    author: "Love Corn",
  },
  {
    quote:
      "Great tasting West African food! Senegal Cocktail was delicious (ginger with hibiscus). Grilled wings and Red Snapper were amazing with the sauce mixture. Nice cozy, clean place!",
    author: "Thomas Cleveland",
  },
];

function Stars() {
  return (
    <span className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="var(--k-gold)" aria-hidden="true">
          <path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.5L6 22l1.5-7.2L2 10l7.1-1.1L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" className="k-surface" style={{ borderTop: "1px solid var(--k-line)" }}>
      <div className="k-container py-16 sm:py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--k-gold)" }}>
          Social Proof
        </p>
        <h2
          className="font-heading text-3xl sm:text-4xl font-extrabold uppercase"
          style={{ color: "var(--k-silk)", letterSpacing: "-0.02em" }}
        >
          What Philadelphia Is Saying
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <article key={i} className="flex flex-col p-6 k-card">
              <Stars />
              <blockquote className="mt-4 flex-1 text-sm" style={{ color: "var(--k-silk)", lineHeight: 1.7, opacity: 0.85 }}>
                “{r.quote}”
              </blockquote>
              <footer className="mt-5 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>
                — {r.author}
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}