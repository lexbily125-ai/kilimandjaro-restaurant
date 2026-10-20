import React from "react";

export default function DishLightbox({ item, onClose }) {
  if (!item) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${item.name} enlarged photo`}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close photo"
        className="k-focus absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full transition-colors k-glass-pill"
        style={{ color: "var(--k-silk)" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <figure
        className="relative max-h-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.image}
          alt={item.name}
          className="max-h-[80vh] w-auto rounded-xl object-contain"
          style={{ boxShadow: "0 0 60px rgba(224,176,52,0.2)" }}
        />
        <figcaption className="mt-4 text-center">
          <p className="font-heading text-lg font-bold" style={{ color: "var(--k-silk)" }}>
            {item.name}
          </p>
          <p className="text-sm" style={{ color: "var(--k-muted)" }}>
            {item.description}
          </p>
        </figcaption>
      </figure>
    </div>
  );
}