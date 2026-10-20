import React, { useState, useEffect } from "react";
import { DINNER_BANNER, CATEGORIES } from "@/data/menu";
import MenuItemCard from "./MenuItemCard";
import DishLightbox from "./DishLightbox";

function CategoryGroup({ id, menuByCategory, qtyMap, onAdd, onInc, onDec, onImageClick }) {
  const items = (menuByCategory && menuByCategory[id]) || [];
  if (items.length === 0) return null;
  const cat = CATEGORIES.find((c) => c.id === id);
  const showBanner = id === "dinner";

  return (
    <div className="scroll-mt-36">
      <div className="mb-6 flex items-center gap-3">
        <span
          className="font-heading text-xs font-bold uppercase tracking-[0.25em]"
          style={{ color: "var(--k-gold)" }}
        >
          {cat?.label}
        </span>
        <span className="h-px flex-1" style={{ background: "var(--k-line)" }} />
        <span className="text-xs font-medium" style={{ color: "var(--k-muted)" }}>
          {items.length} items
        </span>
      </div>

      {showBanner && (
        <div
          className="mb-6 flex items-start gap-3 rounded-xl border p-4"
          style={{ borderColor: "var(--k-terracotta)", backgroundColor: "rgba(200,90,50,0.1)" }}
          role="note"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--k-terracotta)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p className="text-sm font-medium" style={{ color: "var(--k-silk)", lineHeight: 1.6 }}>
            {DINNER_BANNER}
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            qty={qtyMap[item.id] || 0}
            onAdd={() => onAdd(item)}
            onInc={() => onInc(item.id)}
            onDec={() => onDec(item.id)}
            onImageClick={onImageClick}
          />
        ))}
      </div>
    </div>
  );
}

export default function MenuSection({ category, menuByCategory, qtyMap, onAdd, onInc, onDec }) {
  const [lightbox, setLightbox] = useState(null);
  const isFullMenu = category === "full_menu";

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  return (
    <section className="k-surface">
      <div className="k-container py-10">
        <div className="space-y-12">
          {isFullMenu
            ? CATEGORIES.map((cat) => (
                <CategoryGroup
                  key={cat.id}
                  id={cat.id}
                  menuByCategory={menuByCategory}
                  qtyMap={qtyMap}
                  onAdd={onAdd}
                  onInc={onInc}
                  onDec={onDec}
                  onImageClick={setLightbox}
                />
              ))
            : (
              <CategoryGroup
                id={category}
                menuByCategory={menuByCategory}
                qtyMap={qtyMap}
                onAdd={onAdd}
                onInc={onInc}
                onDec={onDec}
                onImageClick={setLightbox}
              />
            )}
        </div>
      </div>

      <DishLightbox item={lightbox} onClose={() => setLightbox(null)} />
    </section>
  );
}