import React from "react";

export default function MenuItemCard({ item, qty, onAdd, onInc, onDec, onImageClick }) {
  const hasQty = qty > 0;

  return (
    <article className="k-card flex flex-col overflow-hidden group">
      {item.image && (
        <button
          type="button"
          onClick={() => onImageClick && onImageClick(item)}
          aria-label={`View larger photo of ${item.name}`}
          className="relative block h-44 w-full overflow-hidden"
          style={{ opacity: item.in_stock === false ? 0.5 : 1 }}
        >
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <span
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(13,12,10,0) 55%, rgba(22,20,18,0.55) 100%)" }}
          />
          <span
            className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full k-glass-pill"
            style={{ color: "var(--k-silk)" }}
            aria-hidden="true"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </span>
        </button>
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* Top row: title + price */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-base font-bold leading-snug" style={{ color: "var(--k-silk)" }}>
            {item.name}
          </h3>
          <span className="shrink-0 font-heading text-lg font-extrabold" style={{ color: "var(--k-gold)" }}>
            ${item.price.toFixed(2)}
          </span>
        </div>

        {/* Middle row: description + tag */}
        <div className="mt-3 flex flex-1 flex-col gap-3">
          <p className="text-sm" style={{ color: "var(--k-muted)", lineHeight: 1.6 }}>
            {item.description}
          </p>
          {item.tag && (
            <span
              className="w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: "var(--k-terracotta)", color: "var(--k-silk)" }}
            >
              {item.tag}
            </span>
          )}
        </div>

        {/* Bottom row: approval badge + action */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold k-glass-pill"
            style={{ color: "var(--k-gold)" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.5L6 22l1.5-7.2L2 10l7.1-1.1L12 2z" />
            </svg>
            {item.approval ? `${item.approval} (${item.ratings})` : `New · ${item.ratings}`}
          </span>

          {item.in_stock === false ? (
            <span
              className="inline-flex h-10 items-center rounded-full px-4 text-xs font-bold uppercase tracking-wide"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--k-muted)" }}
            >
              Out of Stock
            </span>
          ) : hasQty ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onDec}
                aria-label={`Decrease ${item.name}`}
                className="k-focus flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-white/5"
                style={{ borderColor: "var(--k-line)", color: "var(--k-silk)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <span
                className="w-7 text-center font-heading text-base font-extrabold"
                style={{ color: "var(--k-silk)" }}
                aria-live="polite"
              >
                {qty}
              </span>
              <button
                onClick={onInc}
                aria-label={`Increase ${item.name}`}
                className="k-focus flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
                style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              aria-label={`Add ${item.name} to cart`}
              className="k-focus inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}