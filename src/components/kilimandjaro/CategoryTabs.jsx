import React, { useEffect, useRef } from "react";
import { CATEGORIES } from "@/data/menu";

const FULL_MENU_TAB = { id: "full_menu", label: "Full Menu" };
const TABS = [FULL_MENU_TAB, ...CATEGORIES];

export default function CategoryTabs({ active, onChange }) {
  const scrollerRef = useRef(null);
  const tabRefs = useRef({});

  useEffect(() => {
    const el = tabRefs.current[active];
    if (el && scrollerRef.current) {
      const container = scrollerRef.current;
      const target = el.offsetLeft - container.clientWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    }
  }, [active]);

  return (
    <div className="sticky top-[64px] z-40" style={{ backgroundColor: "#0D0C0A", borderBottom: "1px solid var(--k-line)" }}>
      <div className="k-container py-4">
        <div
          ref={scrollerRef}
          className="no-scrollbar flex gap-2 overflow-x-auto rounded-full p-1.5 k-glass-pill"
          role="tablist"
          aria-label="Menu categories"
        >
          {TABS.map((cat) => {
            const isActive = active === cat.id;
            return (
              <button
                key={cat.id}
                ref={(el) => (tabRefs.current[cat.id] = el)}
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(cat.id)}
                className="k-focus shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors"
                style={{
                  backgroundColor: isActive ? "var(--k-gold)" : "transparent",
                  color: isActive ? "var(--k-surface)" : "var(--k-muted)",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] font-medium md:hidden" style={{ color: "var(--k-muted)" }}>Swipe categories →</p>
      </div>
    </div>
  );
}