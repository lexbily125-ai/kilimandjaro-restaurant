import React, { useState, useEffect } from "react";
import { MODIFIERS } from "@/data/menu";

export default function ModifierModal({ item, onConfirm, onClose }) {
  const [selections, setSelections] = useState({});
  const [special, setSpecial] = useState("");
  const groups = item ? MODIFIERS[item.id] || [] : [];

  useEffect(() => {
    if (!item) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  // reset selections when the item changes
  useEffect(() => {
    setSelections({});
    setSpecial("");
  }, [item?.id]);

  if (!item) return null;

  const allRequiredSelected = groups.every((g) => !g.required || selections[g.id]);

  const handleConfirm = () => {
    if (!allRequiredSelected) return;
    const labels = {};
    groups.forEach((g) => {
      const opt = g.options.find((o) => o.id === selections[g.id]);
      if (opt) labels[g.id] = opt.label;
    });
    onConfirm(labels, special.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[1500] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Customize ${item.name}`}
    >
      <div
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl sm:max-w-md sm:rounded-2xl"
        style={{ backgroundColor: "var(--k-card)", border: "1px solid var(--k-line)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative shrink-0">
          {item.image && (
            <div className="h-28 w-full overflow-hidden sm:rounded-t-2xl">
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              <span
                className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(22,20,18,0) 25%, rgba(22,20,18,0.96) 100%)" }}
              />
            </div>
          )}
          <div className="flex items-start justify-between px-5 pb-3 pt-4">
            <div>
              <h2 className="font-heading text-lg font-extrabold leading-tight" style={{ color: "var(--k-silk)" }}>
                {item.name}
              </h2>
              <p className="mt-0.5 font-heading text-sm font-bold" style={{ color: "var(--k-gold)" }}>
                ${item.price.toFixed(2)}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="k-focus flex h-9 w-9 items-center justify-center rounded-full k-glass-pill"
              style={{ color: "var(--k-silk)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modifier groups */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="space-y-6">
            {groups.map((g) => (
              <div key={g.id}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-heading text-sm font-bold" style={{ color: "var(--k-silk)" }}>
                    {g.label}
                  </span>
                  {g.required && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: "var(--k-terracotta)", color: "var(--k-silk)" }}
                    >
                      Required
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {g.options.map((opt) => {
                    const selected = selections[g.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelections((s) => ({ ...s, [g.id]: opt.id }))}
                        className="k-focus flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
                        style={{
                          borderColor: selected ? "var(--k-gold)" : "var(--k-line)",
                          backgroundColor: selected ? "rgba(224,176,52,0.08)" : "transparent",
                        }}
                      >
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                          style={{ borderColor: selected ? "var(--k-gold)" : "var(--k-muted)" }}
                        >
                          {selected && (
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--k-gold)" }} />
                          )}
                        </span>
                        <span className="text-sm font-medium" style={{ color: "var(--k-silk)" }}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special instructions */}
        <div className="px-5 pb-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>
            Special Instructions
          </label>
          <textarea
            value={special}
            onChange={(e) => setSpecial(e.target.value)}
            placeholder="Allergies, spice level, extra notes for the kitchen…"
            rows={2}
            className="k-input resize-none"
          />
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4" style={{ borderTop: "1px solid var(--k-line)" }}>
          <button
            onClick={handleConfirm}
            disabled={!allRequiredSelected}
            className="k-focus flex h-12 w-full items-center justify-center rounded-full text-sm font-bold uppercase tracking-wide transition-transform hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}
          >
            Add to Order — ${item.price.toFixed(2)}
          </button>
          {!allRequiredSelected && (
            <p className="mt-2 text-center text-[11px]" style={{ color: "var(--k-muted)" }}>
              Select all required options to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}