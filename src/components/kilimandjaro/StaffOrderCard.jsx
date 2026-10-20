import React from "react";
import { Phone, Printer, CheckCheck, Bike, MapPin } from "lucide-react";

// Kitchen-queue ticket card. High-contrast line items sit at the top of the
// card; metadata and the conditional action buttons follow below.
export default function StaffOrderCard({ order, now, onAck, onAdvance, onComplete, onPrint }) {
  const ageMins = Math.floor((now - new Date(order.created_date).getTime()) / 60000);
  const urgent = ageMins > 10;
  const warn = !urgent && ageMins >= 5;
  const borderColor = urgent ? "var(--k-terracotta)" : warn ? "var(--k-gold)" : "var(--k-line)";

  const isDelivery = order.order_type === "delivery";
  const needsOutForDelivery = isDelivery && order.status !== "out_for_delivery";
  const isDone = order.status === "completed" || order.status === "refunded";

  return (
    <div
      className={`rounded-2xl p-4 ${urgent ? "k-pulse-border" : ""}`}
      style={{
        background: !order.chef_acknowledged ? "rgba(200,90,50,0.10)" : "var(--k-card)",
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* High-contrast line items, prominently at the top */}
      <div className="space-y-1.5">
        {(order.items || []).map((it, i) => (
          <div key={i}>
            <p className="text-white text-lg font-bold leading-tight">{it.qty}× {it.name}</p>
            {it.modifiers && Object.keys(it.modifiers).length > 0 && (
              <p className="text-sm font-semibold" style={{ color: "var(--k-gold)" }}>→ {Object.values(it.modifiers).join(", ")}</p>
            )}
            {it.special_instructions && (
              <p className="text-sm font-medium italic" style={{ color: "var(--k-terracotta)" }}>“{it.special_instructions}”</p>
            )}
          </div>
        ))}
      </div>

      {/* Timestamps & metadata */}
      <div className="mt-3 flex items-start justify-between gap-2" style={{ borderTop: "1px solid var(--k-line)", paddingTop: 10 }}>
        <div className="min-w-0">
          <p className="text-sm font-bold" style={{ color: "var(--k-silk)" }}>
            #{(order.id || "").slice(-5).toUpperCase()} · {order.customer_name}
          </p>
          <p className="text-xs" style={{ color: "var(--k-muted)" }}>
            {isDelivery ? "DELIVERY" : "PICKUP"}{order.order_source === "pos" ? " · POS" : ""} · {new Date(order.created_date).toLocaleTimeString()} · {ageMins}m ago · {order.payment_method === "cash" ? "CASH" : "CARD"}
          </p>
          <p className="text-xs" style={{ color: "var(--k-muted)" }}>
            <Phone className="mr-1 inline h-3 w-3" />{order.customer_phone || "—"}
          </p>
          {isDelivery && order.delivery_address && (
            <p className="text-xs" style={{ color: "var(--k-muted)" }}><MapPin className="mr-1 inline h-3 w-3" />{order.delivery_address}</p>
          )}
          {order.delivery_notes && (
            <p className="text-xs italic" style={{ color: "var(--k-gold)" }}>Notes: {order.delivery_notes}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase" style={{ background: "var(--k-gold)", color: "var(--k-surface)" }}>
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Conditional action buttons */}
      <div className="mt-3 flex flex-wrap gap-2">
        {!order.chef_acknowledged ? (
          <button
            onClick={() => onAck(order)}
            className="k-focus inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-5 text-[18px] font-bold uppercase"
            style={{ background: "var(--k-gold)", color: "var(--k-surface)" }}
          >
            <CheckCheck className="h-5 w-5" /> Acknowledge &amp; Start
          </button>
        ) : !isDone ? (
          <button
            onClick={() => (needsOutForDelivery ? onAdvance(order) : onComplete(order))}
            className="k-focus inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-5 text-[18px] font-bold uppercase"
            style={{ background: "var(--k-silk)", color: "var(--k-surface)" }}
          >
            {needsOutForDelivery ? <><Bike className="h-5 w-5" /> Out for Delivery</> : <>✓ Mark Completed</>}
          </button>
        ) : (
          <span
            className="inline-flex h-14 w-full items-center justify-center rounded-full px-5 text-[18px] font-bold uppercase"
            style={{ background: "rgba(80,140,200,0.18)", color: "#7fb4e8" }}
          >
            {order.status.replace(/_/g, " ")}
          </span>
        )}
        <button
          onClick={() => onPrint(order)}
          className="k-focus inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-5 text-[18px] font-bold uppercase"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--k-line)", color: "var(--k-silk)" }}
        >
          <Printer className="h-5 w-5" /> Print
        </button>
      </div>
    </div>
  );
}