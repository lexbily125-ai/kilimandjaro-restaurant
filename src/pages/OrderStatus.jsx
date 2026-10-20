import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const STATUS_STYLES = {
  pending: { bg: "rgba(224,176,52,0.15)", color: "var(--k-gold)" },
  preparing: { bg: "rgba(200,90,50,0.15)", color: "var(--k-terracotta)" },
  out_for_delivery: { bg: "rgba(80,140,200,0.18)", color: "#7fb4e8" },
  completed: { bg: "rgba(80,160,90,0.18)", color: "#7fd08a" },
  refunded: { bg: "rgba(255,255,255,0.08)", color: "var(--k-muted)" },
};

function stagesFor(order) {
  if (order.order_type === "delivery") {
    return [
      { key: "pending", label: "Order Placed" },
      { key: "preparing", label: "In the Kitchen" },
      { key: "out_for_delivery", label: "Out for Delivery" },
      { key: "completed", label: "Delivered" },
    ];
  }
  return [
    { key: "pending", label: "Order Placed" },
    { key: "preparing", label: "In the Kitchen" },
    { key: "completed", label: "Ready for Pickup" },
  ];
}

function Tracker({ order, now }) {
  if (order.status === "refunded") {
    return <p className="text-xs font-semibold" style={{ color: "var(--k-muted)" }}>Refund processed — funds released.</p>;
  }
  const stages = stagesFor(order);
  const idx = Math.max(0, stages.findIndex((s) => s.key === order.status));
  const mins = (iso) => (iso ? Math.max(0, Math.floor((now - new Date(iso)) / 60000)) : null);
  const orderedMins = mins(order.created_date);
  const prepMins = mins(order.prep_started_at);
  const roadMins = mins(order.out_for_delivery_at);

  return (
    <div className="mt-4">
      <div className="flex items-center">
        {stages.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center" style={{ width: 64 }}>
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                  style={{
                    background: done || active ? "var(--k-gold)" : "rgba(255,255,255,0.08)",
                    color: done || active ? "var(--k-surface)" : "var(--k-muted)",
                    boxShadow: active ? "0 0 0 4px rgba(225,173,1,0.18)" : "none",
                  }}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className="mt-1 text-center text-[9px] font-semibold uppercase leading-tight" style={{ color: active ? "var(--k-silk)" : "var(--k-muted)" }}>{s.label}</span>
              </div>
              {i < stages.length - 1 && (
                <div className="h-0.5 flex-1 -mt-4" style={{ background: i < idx ? "var(--k-gold)" : "rgba(255,255,255,0.10)" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px]" style={{ color: "var(--k-muted)" }}>
        <span>🟡 Ordered {orderedMins}m ago</span>
        {prepMins != null && <span>🔥 In kitchen {prepMins}m</span>}
        {roadMins != null && <span>🛵 On the road {roadMins}m</span>}
        {order.status === "preparing" && <span>⏱ ETA ~{order.eta_minutes || 20}m</span>}
      </div>
    </div>
  );
}

export default function OrderStatus() {
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  const lastQuery = useRef(null);

  const runSearch = async (phoneVal, orderVal) => {
    if (!phoneVal.trim() || !orderVal.trim()) {
      setError("Enter both your phone number and Order ID.");
      setResults(null);
      return;
    }
    setError(""); setLoading(true);
    try {
      const list = await base44.entities.Order.filter({ customer_phone: phoneVal.trim() }, "-created_date", 50);
      const code = orderVal.trim().toUpperCase().replace(/^#/, "");
      const matched = (list || []).filter((o) => (o.id || "").toUpperCase().endsWith(code));
      if (matched.length === 0) {
        setError("No order found matching that phone number and Order ID");
        setResults([]);
        lastQuery.current = null;
      } else {
        setResults(matched);
        lastQuery.current = { phone: phoneVal, code: orderVal };
      }
    } catch (e) {
      setError("Could not look up your order. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const search = () => runSearch(phone, orderId);

  // Live sync — refresh results whenever a kitchen ticket changes state
  useEffect(() => {
    const unsub = base44.entities.Order.subscribe(() => {
      if (lastQuery.current) runSearch(lastQuery.current.phone, lastQuery.current.code);
    });
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  const requestRefund = async (order) => {
    if (!window.confirm("Request a refund for this order? Our team will review and process it.")) return;
    await base44.entities.Order.update(order.id, { refund_requested: true });
    search();
  };

  return (
    <div className="k-surface min-h-screen">
      <header className="k-glass-header">
        <div className="k-container flex h-16 items-center justify-between">
          <h1 className="font-heading text-lg font-extrabold uppercase tracking-tight" style={{ color: "var(--k-silk)" }}>Track Your Order</h1>
          <Link to="/" className="k-focus inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold k-glass-pill" style={{ color: "var(--k-silk)" }}>← Menu</Link>
        </div>
      </header>

      <div className="k-container py-8">
        <div className="mx-auto max-w-lg">
          <p className="mb-4 text-sm" style={{ color: "var(--k-muted)" }}>Enter your phone number and Order ID (from your confirmation) to see your live order status.</p>
          <div className="space-y-2">
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="Phone number — (215) 000-0000" className="k-input" />
            <div className="flex gap-2">
              <input value={orderId} onChange={(e) => setOrderId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="Order ID — e.g. A1B2C3" className="k-input" />
              <button onClick={search} disabled={loading} className="k-focus inline-flex h-12 shrink-0 items-center rounded-full px-5 text-sm font-bold uppercase tracking-wide disabled:opacity-50" style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}>{loading ? "…" : "Find"}</button>
            </div>
          </div>
          {error && <p className="mt-2 text-xs" style={{ color: "var(--k-terracotta)" }}>{error}</p>}
        </div>

        <div className="mx-auto mt-8 max-w-lg space-y-3">
          {results && results.map((order) => (
            <div key={order.id} className="rounded-xl p-4 k-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--k-silk)" }}>{order.customer_name}</p>
                  <p className="text-xs" style={{ color: "var(--k-muted)" }}>{new Date(order.created_date).toLocaleString()} · {order.order_type === "delivery" ? "Delivery" : "Pickup"} · {order.pickup_time || "ASAP"}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide" style={STATUS_STYLES[order.status] || STATUS_STYLES.pending}>{order.status.replace(/_/g, " ")}</span>
                  <p className="mt-1 text-base font-extrabold" style={{ color: "var(--k-silk)" }}>${Number(order.total).toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                {(order.items || []).map((it, i) => (
                  <p key={i} className="text-xs" style={{ color: "var(--k-muted)" }}>
                    {it.qty}× {it.name}
                    {it.modifiers && Object.keys(it.modifiers).length > 0 && <span style={{ color: "var(--k-gold)" }}> · {Object.values(it.modifiers).join(" · ")}</span>}
                    {it.special_instructions && <span style={{ color: "var(--k-terracotta)" }}> · “{it.special_instructions}”</span>}
                  </p>
                ))}
              </div>

              <Tracker order={order} now={now} />

              <div className="mt-4">
                {order.status === "refunded" ? (
                  <p className="text-xs font-semibold" style={{ color: "var(--k-muted)" }}>Refund processed — funds released.</p>
                ) : order.refund_requested ? (
                  <p className="text-xs font-semibold" style={{ color: "var(--k-terracotta)" }}>Refund requested — awaiting review.</p>
                ) : (
                  <button onClick={() => requestRefund(order)} className="k-focus inline-flex h-9 items-center rounded-full px-4 text-xs font-bold uppercase tracking-wide" style={{ backgroundColor: "rgba(200,90,50,0.15)", color: "var(--k-terracotta)", border: "1px solid var(--k-terracotta)" }}>Request Refund</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}