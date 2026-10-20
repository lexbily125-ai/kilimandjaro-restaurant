import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

const STATUSES = ["pending", "preparing", "out_for_delivery", "completed", "refunded"];

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="k-focus rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide"
      style={
        active
          ? { backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }
          : { backgroundColor: "rgba(255,255,255,0.04)", color: "var(--k-muted)" }
      }
    >
      {children}
    </button>
  );
}

// Tab 3 — split into two sub-tabs so staff never scroll past the menu list to
// reach order management: "stock" (1-tap toggles) or "orders" (status board).
export default function StaffStockOrders({ section = "stock", menuItems, onToggleStock, orders, onUpdateStatus }) {
  const [menuSearch, setMenuSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredMenu = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    if (!q) return menuItems;
    return menuItems.filter(
      (m) => (m.name || "").toLowerCase().includes(q) || (m.category_label || "").toLowerCase().includes(q)
    );
  }, [menuItems, menuSearch]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (o.customer_name || "").toLowerCase().includes(q) ||
        (o.customer_phone || "").toLowerCase().includes(q) ||
        (o.id || "").toLowerCase().includes(q)
      );
    });
  }, [orders, orderSearch, statusFilter]);

  return (
    <div className="space-y-8">
      {/* Stock */}
      {section === "stock" && (
      <div>
        <h2 className="font-heading text-base font-bold" style={{ color: "var(--k-silk)" }}>
          Menu Stock ({filteredMenu.length})
        </h2>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--k-muted)" }} />
          <input value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} placeholder="Search menu items…" className="k-input pl-10" />
        </div>
        <div className="mt-3 space-y-2">
          {filteredMenu.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-xl p-3 k-card">
              <p className="min-w-0 flex-1 truncate text-sm font-bold" style={{ color: "var(--k-silk)" }}>{m.name}</p>
              <button
                onClick={() => onToggleStock(m)}
                className="k-focus inline-flex h-12 items-center rounded-full px-5 text-[15px] font-bold uppercase tracking-wide"
                style={
                  m.in_stock !== false
                    ? { backgroundColor: "rgba(80,160,90,0.18)", color: "#7fd08a" }
                    : { backgroundColor: "rgba(255,255,255,0.06)", color: "var(--k-muted)" }
                }
              >
                {m.in_stock !== false ? "In Stock" : "Out of Stock"}
              </button>
            </div>
          ))}
          {filteredMenu.length === 0 && <p className="text-sm" style={{ color: "var(--k-muted)" }}>No items found.</p>}
        </div>
      </div>
      )}

      {/* Orders */}
      {section === "orders" && (
      <div>
        <h2 className="font-heading text-base font-bold" style={{ color: "var(--k-silk)" }}>
          Orders ({filteredOrders.length})
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>All</FilterChip>
          {STATUSES.map((s) => (
            <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {s.replace(/_/g, " ")}
            </FilterChip>
          ))}
        </div>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--k-muted)" }} />
          <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Search orders by name, phone, or ID…" className="k-input pl-10" />
        </div>
        <div className="mt-3 space-y-2">
          {filteredOrders.map((o) => {
            const hasRefundRequest =
              Boolean(o.refund_requested || o.refundRequested) && o.status !== "refunded";
            return (
              <div
                key={o.id}
                className={`rounded-xl p-3 border-2 ${hasRefundRequest ? "border-[#C85A32]" : "border-white/10"}`}
                style={hasRefundRequest ? { backgroundColor: "rgba(200,90,50,0.06)" } : undefined}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {hasRefundRequest && (
                      <span className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-md border border-[#C85A32] bg-[#C85A32] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                        ⚠️ REFUND REQUESTED
                      </span>
                    )}
                    <p className="truncate text-sm font-bold" style={{ color: "var(--k-silk)" }}>
                      {o.customer_name} · ${Number(o.total).toFixed(2)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase" style={{ background: "rgba(255,255,255,0.08)", color: "var(--k-muted)" }}>
                    {o.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-1 text-xs" style={{ color: "var(--k-muted)" }}>
                  {o.customer_phone || "—"} · {new Date(o.created_date).toLocaleString()}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="text-[11px] font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Status:</label>
                  <select
                    value={o.status}
                    onChange={(e) => onUpdateStatus(o, e.target.value)}
                    className="h-11 rounded-lg px-2 text-sm"
                    style={{ backgroundColor: "var(--k-card)", border: "1px solid var(--k-line)", color: "var(--k-silk)" }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} style={{ background: "var(--k-card)" }}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
          {filteredOrders.length === 0 && <p className="text-sm" style={{ color: "var(--k-muted)" }}>No orders found.</p>}
        </div>
      </div>
      )}
    </div>
  );
}