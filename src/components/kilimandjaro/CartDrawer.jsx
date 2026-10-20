import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { TAX_RATE } from "@/data/menu";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const PICKUP_TIMES = ["ASAP", "15 min", "30 min", "45 min", "60 min"];
const TIP_OPTIONS = [
  { label: "15%", pct: 15 },
  { label: "20%", pct: 20 },
  { label: "25%", pct: 25 },
];

export default function CartDrawer({ open, onClose, items, onInc, onDec, onRemove, onSubmitOrder }) {
  const { settings } = useStoreSettings();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupTime, setPickupTime] = useState("ASAP");
  const [orderType, setOrderType] = useState("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [tipPct, setTipPct] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoError("");
    try {
      const list = await base44.entities.Promotion.list("-created_date", 200);
      const p = (list || []).find((x) => x.code === code && x.active !== false);
      if (!p) { setPromoError("Invalid or expired code."); setAppliedPromo(null); return; }
      if ((p.max_uses || 0) > 0 && (p.uses || 0) >= p.max_uses) { setPromoError("This code has reached its usage limit."); setAppliedPromo(null); return; }
      setAppliedPromo(p);
    } catch (e) {
      setPromoError("Could not verify code. Please try again.");
    }
  };

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflowY;
    const top = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${top}px`;
    document.body.style.width = "100%";
    document.body.style.overflowY = "scroll";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = original;
      window.scrollTo(0, top);
    };
  }, [open]);

  useEffect(() => {
    const pOn = settings?.pickup_enabled !== false;
    const dOn = settings?.delivery_enabled !== false;
    if (!pOn && dOn) setOrderType("delivery");
    else if (pOn && !dOn) setOrderType("pickup");
  }, [settings?.pickup_enabled, settings?.delivery_enabled]);

  // Auto-fill returning guest details saved from a previous checkout
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("kj_customer_profile") || "null");
      if (!p) return;
      if (p.customer_name) setName(p.customer_name);
      if (p.customer_phone) setPhone(p.customer_phone);
      if (p.delivery_address) setDeliveryAddress(p.delivery_address);
    } catch { /* ignore malformed profile */ }
  }, []);

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  let discount = 0;
  if (appliedPromo && subtotal >= (appliedPromo.min_subtotal || 0)) {
    discount = appliedPromo.discount_type === "percent"
      ? Math.round(subtotal * (appliedPromo.value / 100) * 100) / 100
      : Math.min(Number(appliedPromo.value) || 0, subtotal);
  }
  const taxedBase = Math.max(subtotal - discount, 0);
  const tax = taxedBase * TAX_RATE;
  const freeDeliveryThreshold = settings?.free_delivery_threshold || 50;
  const deliveryFee =
    orderType === "delivery"
      ? subtotal >= freeDeliveryThreshold
        ? 0
        : settings?.delivery_base_fee || 0
      : 0;
  const freeDeliveryRemaining = Math.max(freeDeliveryThreshold - subtotal, 0);
  const tip = tipPct === "custom" ? Math.max(parseFloat(customTip) || 0, 0) : Math.round(subtotal * (tipPct / 100) * 100) / 100;
  const total = subtotal - discount + tax + deliveryFee + tip;

  const paused = !!settings?.paused;
  const pickupOn = settings?.pickup_enabled !== false;
  const deliveryOn = settings?.delivery_enabled !== false;
  const anyOpen = pickupOn || deliveryOn;
  const canCheckout = items.length > 0 && name.trim() && phone.trim() && (orderType === "pickup" || deliveryAddress.trim()) && !paused && anyOpen;

  const handleCheckout = () => {
    if (!canCheckout) return;
    try {
      localStorage.setItem("kj_customer_profile", JSON.stringify({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        delivery_address: deliveryAddress.trim(),
      }));
    } catch { /* localStorage unavailable — ignore */ }
    onSubmitOrder({
      name: name.trim(),
      phone: phone.trim(),
      pickupTime: orderType === "pickup" ? pickupTime : "ASAP",
      orderType,
      deliveryAddress: orderType === "delivery" ? deliveryAddress.trim() : "",
      deliveryNotes: deliveryNotes.trim(),
      tip,
      promoCode: appliedPromo ? appliedPromo.code : "",
      discount,
    });
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[1100] transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your order"
        className="animation-drawer fixed right-0 top-0 z-[1200] flex h-[100dvh] w-[420px] max-w-[100vw] flex-col"
        style={{ backgroundColor: "var(--k-card)", borderLeft: "1px solid var(--k-line)", transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--k-line)" }}>
          <h2 className="font-heading text-base font-extrabold uppercase tracking-tight" style={{ color: "var(--k-silk)" }}>Your Order</h2>
          <button onClick={onClose} aria-label="Close cart" className="k-focus flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/5" style={{ color: "var(--k-muted)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {(paused || !anyOpen) && (
          <div className="mx-5 mt-4 rounded-xl p-3 text-xs font-semibold" style={{ background: "rgba(200,90,50,0.12)", border: "1px solid var(--k-terracotta)", color: "var(--k-terracotta)" }}>
            {!anyOpen ? "Online ordering is currently unavailable. Please call us to place an order." : "The kitchen is currently closed — ordering is paused. Please check back soon."}
          </div>
        )}

        {!paused && anyOpen && orderType === "delivery" && freeDeliveryRemaining > 0 && (
          <div className="mx-5 mt-4 rounded-xl p-3 text-xs font-semibold" style={{ background: "rgba(225,173,1,0.10)", border: "1px solid var(--k-gold)", color: "var(--k-gold)" }}>
            Add ${freeDeliveryRemaining.toFixed(2)} more for FREE Delivery!
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--k-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p className="mt-4 text-sm" style={{ color: "var(--k-muted)" }}>Your cart is empty.</p>
              <p className="mt-1 text-xs" style={{ color: "var(--k-muted)", opacity: 0.7 }}>Tap the + on any dish to start your order.</p>
            </div>
          ) : (
            <>
              {/* Order type toggle */}
              <div className="mb-4 flex gap-2">
                <button onClick={() => pickupOn && setOrderType("pickup")} disabled={!pickupOn} className="k-focus flex-1 rounded-full py-2.5 text-xs font-bold uppercase tracking-wide disabled:opacity-40" style={{ background: orderType === "pickup" ? "var(--k-gold)" : "rgba(255,255,255,0.05)", color: orderType === "pickup" ? "var(--k-surface)" : "var(--k-muted)", border: "1px solid var(--k-line)" }}>Pickup</button>
                <button onClick={() => deliveryOn && setOrderType("delivery")} disabled={!deliveryOn} className="k-focus flex-1 rounded-full py-2.5 text-xs font-bold uppercase tracking-wide disabled:opacity-40" style={{ background: orderType === "delivery" ? "var(--k-gold)" : "rgba(255,255,255,0.05)", color: orderType === "delivery" ? "var(--k-surface)" : "var(--k-muted)", border: "1px solid var(--k-line)" }}>Delivery</button>
              </div>

              <ul className="space-y-4">
                {items.map((it) => (
                  <li key={it.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold" style={{ color: "var(--k-silk)" }}>{it.name}</p>
                      {it.modifiers && Object.keys(it.modifiers).length > 0 && (
                        <p className="mt-0.5 text-xs" style={{ color: "var(--k-gold)" }}>{Object.values(it.modifiers).join(" · ")}</p>
                      )}
                      {it.special_instructions && (
                        <p className="mt-0.5 text-xs italic" style={{ color: "var(--k-muted)" }}>“{it.special_instructions}”</p>
                      )}
                      <p className="text-xs" style={{ color: "var(--k-muted)" }}>${it.price.toFixed(2)} each</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button onClick={() => onDec(it.id)} aria-label={`Decrease ${it.name}`} className="k-focus flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-white/5" style={{ borderColor: "var(--k-line)", color: "var(--k-silk)" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </button>
                        <span className="w-6 text-center text-sm font-bold" style={{ color: "var(--k-silk)" }} aria-live="polite">{it.qty}</span>
                        <button onClick={() => onInc(it.id)} aria-label={`Increase ${it.name}`} className="k-focus flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </button>
                        <button onClick={() => onRemove(it.id)} aria-label={`Remove ${it.name}`} className="k-focus ml-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors" style={{ color: "var(--k-muted)" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--k-terracotta)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--k-muted)")}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--k-silk)" }}>${(it.price * it.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-4 pt-5" style={{ borderTop: "1px solid var(--k-line)" }}>
                <div>
                  <label htmlFor="cust-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Customer Name</label>
                  <input id="cust-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="k-input" />
                </div>
                <div>
                  <label htmlFor="cust-phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Phone Number</label>
                  <input id="cust-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(215) 000-0000" className="k-input" />
                </div>

                {orderType === "pickup" ? (
                  <div>
                    <label htmlFor="pickup-time" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Pickup Time</label>
                    <select id="pickup-time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="k-input" style={{ backgroundColor: "var(--k-card)" }}>
                      {PICKUP_TIMES.map((t) => (<option key={t} value={t} style={{ background: "var(--k-card)" }}>{t}</option>))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="del-addr" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Delivery Address</label>
                      <input id="del-addr" type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Street address, city, zip" className="k-input" />
                    </div>
                    <div>
                      <label htmlFor="del-notes" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Delivery / Order Notes</label>
                      <textarea id="del-notes" value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} rows={2} placeholder="Gate code, drop-off instructions, allergies…" className="k-input resize-none" />
                    </div>
                  </>
                )}

                {/* Tip */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Add a Tip</label>
                  <div className="flex gap-2">
                    {TIP_OPTIONS.map((t) => (
                      <button key={t.pct} onClick={() => setTipPct(t.pct)} className="k-focus flex-1 rounded-full py-2 text-xs font-bold uppercase" style={{ background: tipPct === t.pct ? "var(--k-gold)" : "rgba(255,255,255,0.05)", color: tipPct === t.pct ? "var(--k-surface)" : "var(--k-muted)", border: "1px solid var(--k-line)" }}>{t.label}</button>
                    ))}
                    <button onClick={() => setTipPct("custom")} className="k-focus flex-1 rounded-full py-2 text-xs font-bold uppercase" style={{ background: tipPct === "custom" ? "var(--k-gold)" : "rgba(255,255,255,0.05)", color: tipPct === "custom" ? "var(--k-surface)" : "var(--k-muted)", border: "1px solid var(--k-line)" }}>Custom</button>
                  </div>
                  {tipPct === "custom" && (
                    <input type="number" min="0" step="0.50" value={customTip} onChange={(e) => setCustomTip(e.target.value)} placeholder="Tip amount $" className="k-input mt-2" />
                  )}
                </div>

                {/* Promo code */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Promo Code</label>
                  <div className="flex gap-2">
                    <input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="e.g. DIRECT15" className="k-input" />
                    <button onClick={applyPromo} className="k-focus inline-flex h-12 shrink-0 items-center rounded-full px-4 text-xs font-bold uppercase tracking-wide" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--k-line)", color: "var(--k-silk)" }}>Apply</button>
                  </div>
                  {promoError && <p className="mt-1 text-[11px]" style={{ color: "var(--k-terracotta)" }}>{promoError}</p>}
                  {appliedPromo && (
                    <p className="mt-1 text-[11px] font-semibold" style={{ color: "var(--k-gold)" }}>
                      ✓ {appliedPromo.code} applied — {appliedPromo.discount_type === "percent" ? `${appliedPromo.value}% off` : `$${Number(appliedPromo.value).toFixed(2)} off`}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-4" style={{ borderTop: "1px solid var(--k-line)" }}>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between" style={{ color: "var(--k-muted)" }}><dt>Subtotal</dt><dd>${subtotal.toFixed(2)}</dd></div>
              <div className="flex justify-between" style={{ color: "var(--k-muted)" }}><dt>Est. Tax (8.0%)</dt><dd>${tax.toFixed(2)}</dd></div>
              {deliveryFee > 0 && <div className="flex justify-between" style={{ color: "var(--k-muted)" }}><dt>Delivery Fee</dt><dd>${deliveryFee.toFixed(2)}</dd></div>}
              {discount > 0 && <div className="flex justify-between" style={{ color: "var(--k-terracotta)" }}><dt>Discount {appliedPromo ? `(${appliedPromo.code})` : ""}</dt><dd>−${discount.toFixed(2)}</dd></div>}
              {tip > 0 && <div className="flex justify-between" style={{ color: "var(--k-gold)" }}><dt>Tip</dt><dd>${tip.toFixed(2)}</dd></div>}
              <div className="flex justify-between pt-2 text-base font-extrabold" style={{ color: "var(--k-silk)", borderTop: "1px solid var(--k-line)" }} aria-live="polite"><dt>Total</dt><dd>${total.toFixed(2)}</dd></div>
            </dl>
            <button onClick={handleCheckout} disabled={!canCheckout} className="k-focus mt-4 flex h-12 w-full items-center justify-center rounded-full text-sm font-bold uppercase tracking-wide transition-transform hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40" style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}>
              Proceed to Payment
            </button>
            {!canCheckout && !paused && <p className="mt-2 text-center text-[11px]" style={{ color: "var(--k-muted)" }}>Add your name, phone{orderType === "delivery" ? " and address" : ""} to check out.</p>}
            <Link to="/orders" onClick={onClose} className="mt-3 block text-center text-[11px] font-semibold" style={{ color: "var(--k-muted)" }}>Track an existing order →</Link>
          </div>
        )}
      </aside>
    </>
  );
}