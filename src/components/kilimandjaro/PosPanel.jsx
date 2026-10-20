import React, { useState, useRef, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { TAX_RATE } from "@/data/menu";
import { Plus, Minus, Trash2, Receipt, CheckCircle2, Search } from "lucide-react";

export default function PosPanel({ menuItems }) {
  const [ticket, setTicket] = useState([]);
  const [payment, setPayment] = useState("card");
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const ticketListRef = useRef(null);

  useEffect(() => {
    const el = ticketListRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [ticket.length]);

  const addItem = (item) => {
    setTicket((prev) => {
      const ex = prev.find((t) => t.id === item.id);
      if (ex) return prev.map((t) => (t.id === item.id ? { ...t, qty: t.qty + 1 } : t));
      return [...prev, { id: item.id, name: item.name, price: Number(item.price), qty: 1 }];
    });
  };
  const inc = (id) => setTicket((p) => p.map((t) => (t.id === id ? { ...t, qty: t.qty + 1 } : t)));
  const dec = (id) => setTicket((p) => p.map((t) => (t.id === id ? { ...t, qty: t.qty - 1 } : t)).filter((t) => t.qty > 0));
  const clear = () => setTicket([]);

  const subtotal = ticket.reduce((s, t) => s + t.price * t.qty, 0);
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return menuItems;
    return menuItems.filter(
      (item) =>
        (item.name || "").toLowerCase().includes(q) ||
        (item.category_label || "").toLowerCase().includes(q)
    );
  }, [menuItems, search]);

  const submit = async () => {
    if (ticket.length === 0) return;
    setSubmitting(true);
    try {
      const order = await base44.entities.Order.create({
        customer_name: name.trim() || "Walk-in (POS)",
        customer_phone: "",
        items: ticket.map((t) => ({ name: t.name, price: t.price, qty: t.qty, modifiers: {}, special_instructions: "" })),
        subtotal,
        tax,
        tip: 0,
        delivery_fee: 0,
        discount: 0,
        total,
        status: "pending",
        order_type: "pickup",
        order_source: "pos",
        payment_method: payment,
        chef_acknowledged: false,
        eta_minutes: 20,
      });
      setLastOrder(order);
      clear();
      setName("");
    } catch (e) {
      alert("Could not send ticket to kitchen. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      {/* Item picker */}
      <div>
        <h2 className="font-heading text-base font-bold" style={{ color: "var(--k-silk)" }}>Quick POS Entry</h2>
        <p className="mt-1 text-xs" style={{ color: "var(--k-muted)" }}>Tap items to build an in-person ticket — it routes straight to the kitchen.</p>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--k-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes or categories…"
            className="k-input pl-10"
          />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.filter((i) => i.in_stock !== false).map((item) => (
            <button
              key={item.id}
              onClick={() => addItem(item)}
              className="k-focus flex items-center justify-between rounded-xl p-3 text-left transition-transform hover:scale-[1.01]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--k-line)" }}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold" style={{ color: "var(--k-silk)" }}>{item.name}</span>
                <span className="text-xs" style={{ color: "var(--k-gold)" }}>${Number(item.price).toFixed(2)}</span>
              </span>
              <span className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--k-gold)", color: "var(--k-surface)" }}>
                <Plus className="h-4 w-4" />
              </span>
            </button>
          ))}
          {menuItems.length === 0 && <p className="text-xs" style={{ color: "var(--k-muted)" }}>No menu items loaded.</p>}
        </div>
      </div>

      {/* Ticket */}
      <div className="rounded-2xl p-4 k-card" style={{ position: "sticky", top: 84, alignSelf: "start" }}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wide" style={{ color: "var(--k-silk)" }}>
            <Receipt className="mr-1 inline h-4 w-4" /> Current Ticket
          </h3>
          {ticket.length > 0 && (
            <button onClick={clear} className="k-focus text-[11px] font-bold uppercase" style={{ color: "var(--k-terracotta)" }}>Clear</button>
          )}
        </div>

        {ticket.length === 0 ? (
          <p className="py-8 text-center text-xs" style={{ color: "var(--k-muted)" }}>No items yet. Tap menu items to add.</p>
        ) : (
          <div ref={ticketListRef} className="max-h-[44vh] space-y-2 overflow-y-auto pr-1">
            {ticket.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button onClick={() => dec(t.id)} className="k-focus flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "var(--k-silk)" }}><Minus className="h-3.5 w-3.5" /></button>
                  <span className="w-6 text-center text-sm font-bold" style={{ color: "var(--k-silk)" }}>{t.qty}</span>
                  <button onClick={() => inc(t.id)} className="k-focus flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "var(--k-gold)", color: "var(--k-surface)" }}><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <span className="min-w-0 flex-1 truncate text-sm" style={{ color: "var(--k-silk)" }}>{t.name}</span>
                <span className="text-sm font-bold" style={{ color: "var(--k-silk)" }}>${(t.price * t.qty).toFixed(2)}</span>
                <button onClick={() => dec(t.id)} className="k-focus" style={{ color: "var(--k-muted)" }}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        )}

        {ticket.length > 0 && (
          <div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name (optional)" className="k-input mt-4" />
            <div className="mt-3 flex gap-2">
              {["card", "cash"].map((m) => (
                <button key={m} onClick={() => setPayment(m)} className="k-focus flex-1 rounded-full py-2.5 text-xs font-bold uppercase tracking-wide" style={{ background: payment === m ? "var(--k-gold)" : "rgba(255,255,255,0.05)", color: payment === m ? "var(--k-surface)" : "var(--k-muted)", border: "1px solid var(--k-line)" }}>
                  {m === "card" ? "In-Person Card" : "Cash"}
                </button>
              ))}
            </div>

            <dl className="mt-4 space-y-1 text-sm" style={{ borderTop: "1px solid var(--k-line)", paddingTop: 12 }}>
              <div className="flex justify-between" style={{ color: "var(--k-muted)" }}><dt>Subtotal</dt><dd>${subtotal.toFixed(2)}</dd></div>
              <div className="flex justify-between" style={{ color: "var(--k-muted)" }}><dt>Tax (8.0%)</dt><dd>${tax.toFixed(2)}</dd></div>
              <div className="flex justify-between pt-1 text-base font-extrabold" style={{ color: "var(--k-silk)" }}><dt>Total</dt><dd>${total.toFixed(2)}</dd></div>
            </dl>

            <button onClick={submit} disabled={submitting} className="k-focus mt-4 flex h-12 w-full items-center justify-center rounded-full text-sm font-bold uppercase tracking-wide disabled:opacity-50" style={{ background: "var(--k-gold)", color: "var(--k-surface)" }}>
              {submitting ? "Sending…" : "Send to Kitchen"}
            </button>
          </div>
        )}

        {lastOrder && (
          <div className="mt-4 flex items-center gap-2 rounded-xl p-3 text-xs" style={{ background: "rgba(80,160,90,0.12)", border: "1px solid rgba(80,160,90,0.4)", color: "#7fd08a" }}>
            <CheckCircle2 className="h-4 w-4 shrink-0" /> Ticket #{(lastOrder.id || "").slice(-5).toUpperCase()} sent to kitchen.
          </div>
        )}
      </div>
    </div>
  );
}