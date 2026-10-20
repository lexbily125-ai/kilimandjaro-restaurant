import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search } from "lucide-react";
import { CATEGORIES } from "@/data/menu";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useAuth } from "@/lib/AuthContext";
import MenuItemForm from "@/components/kilimandjaro/MenuItemForm";
import PayoutsPanel from "@/components/kilimandjaro/PayoutsPanel";
import PosPanel from "@/components/kilimandjaro/PosPanel";
import PromotionsPanel from "@/components/kilimandjaro/PromotionsPanel";
import StaffPanel from "@/components/kilimandjaro/StaffPanel";

const ORDER_STATUSES = ["pending", "preparing", "out_for_delivery", "completed", "refunded"];

const STATUS_STYLES = {
  pending: { bg: "rgba(224,176,52,0.15)", color: "var(--k-gold)" },
  preparing: { bg: "rgba(200,90,50,0.15)", color: "var(--k-terracotta)" },
  out_for_delivery: { bg: "rgba(80,140,200,0.18)", color: "#7fb4e8" },
  completed: { bg: "rgba(80,160,90,0.18)", color: "#7fd08a" },
  refunded: { bg: "rgba(255,255,255,0.08)", color: "var(--k-muted)" },
};

export default function Admin() {
  const { settings, update: updateSettings } = useStoreSettings();
  const { isOwnerAdmin } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [gateError, setGateError] = useState("");

  const [tab, setTab] = useState("menu");
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [menuSearch, setMenuSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  const api = base44.entities.MenuItem;

  const loadMenu = useCallback(async () => {
    setMenuLoading(true);
    try {
      const list = await base44.entities.MenuItem.list("-created_date", 500);
      setMenuItems(list || []);
    } catch (e) {
      setMenuItems([]);
    } finally {
      setMenuLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const list = await base44.entities.Order.list("-created_date", 200);
      setOrders(list || []);
    } catch (e) {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    loadMenu();
    loadOrders();
    const u1 = base44.entities.MenuItem.subscribe(() => loadMenu());
    const u2 = base44.entities.Order.subscribe(() => loadOrders());
    return () => {
      u1 && u1();
      u2 && u2();
    };
  }, [unlocked, loadMenu, loadOrders]);

  // Owner account auto-elevation: skip the master-password gate
  useEffect(() => {
    if (isOwnerAdmin && !unlocked) setUnlocked(true);
  }, [isOwnerAdmin, unlocked]);

  const submitGate = () => {
    setGateError("");
    if (!settings) return;
    if (!settings.master_password) {
      if (pw.trim().length < 4) { setGateError("Choose a password of at least 4 characters."); return; }
      if (pw !== pwConfirm) { setGateError("Passwords do not match."); return; }
      updateSettings({ master_password: pw.trim() }).then(() => { setUnlocked(true); setPw(""); setPwConfirm(""); }).catch(() => setGateError("Could not save password."));
      return;
    }
    if (pw === settings.master_password) {
      setUnlocked(true);
      setGateError("");
      setPw("");
      setPwConfirm("");
    } else {
      setGateError("Incorrect master password.");
    }
  };

  const toggleStock = async (item) => {
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? { ...m, in_stock: !m.in_stock } : m)));
    try {
      await api.update(item.id, { in_stock: !item.in_stock });
    } catch (e) {
      loadMenu();
    }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This removes it from the menu.`)) return;
    await api.delete(item.id);
  };

  const updateOrderStatus = async (order, status) => {
    await base44.entities.Order.update(order.id, { status });
  };

  const processRefund = async (order) => {
    if (!window.confirm(`Process refund for ${order.customer_name}'s order ($${order.total.toFixed(2)})?`)) return;
    await base44.entities.Order.update(order.id, { status: "refunded", refund_requested: true });
  };

  // Delivery orders advance to "out_for_delivery" first; everything else
  // (pickup / POS) jumps straight to "completed".
  const advanceOrder = async (order) => {
    if (order.order_type === "delivery" && order.status !== "out_for_delivery") {
      await base44.entities.Order.update(order.id, { status: "out_for_delivery", out_for_delivery_at: new Date().toISOString() });
    } else {
      await base44.entities.Order.update(order.id, { status: "completed", delivered_at: new Date().toISOString() });
    }
  };

  if (!unlocked) {
    if (isOwnerAdmin) {
      return (
        <div className="k-surface flex min-h-screen items-center justify-center px-6">
          <div className="rounded-2xl p-6 text-center k-card">
            <p className="text-sm font-semibold" style={{ color: "var(--k-silk)" }}>
              Recognized owner — opening admin dashboard…
            </p>
          </div>
        </div>
      );
    }
    const firstTime = settings && !settings.master_password;
    return (
      <div className="k-surface flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <h1 className="font-heading text-2xl font-extrabold uppercase tracking-tight" style={{ color: "var(--k-silk)" }}>
              Admin Portal
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--k-muted)" }}>
              Kilimandjaro Restaurant · Staff Access
            </p>
          </div>
          <div className="rounded-2xl p-6 k-card">
            {!settings ? (
              <p className="text-sm" style={{ color: "var(--k-muted)" }}>Loading…</p>
            ) : (
              <>
                <p className="mb-4 text-xs" style={{ color: "var(--k-muted)" }}>
                  {firstTime
                    ? "Set a memorable master password now — you'll use it to open the admin dashboard every time."
                    : "Enter your master password to continue."}
                </p>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>
                  Master Password
                </label>
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && pw && submitGate()}
                  placeholder="••••••"
                  className="k-input"
                  autoFocus
                />
                {firstTime && (
                  <>
                    <label className="mt-3 mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={pwConfirm}
                      onChange={(e) => setPwConfirm(e.target.value)}
                      placeholder="••••••"
                      className="k-input"
                    />
                  </>
                )}
                {gateError && <p className="mt-2 text-xs" style={{ color: "var(--k-terracotta)" }}>{gateError}</p>}
                <button
                  onClick={submitGate}
                  disabled={pw.length === 0}
                  className="k-focus mt-4 flex h-12 w-full items-center justify-center rounded-full text-sm font-bold uppercase tracking-wide disabled:opacity-50"
                  style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}
                >
                  {firstTime ? "Set Password & Enter" : "Unlock"}
                </button>
                <p className="mt-3 text-center text-[11px]" style={{ color: "var(--k-muted)" }}>
                  Authorized admins: lexbily125@gmail.com · isyoumaba70@gmail.com
                </p>
              </>
            )}
            <Link to="/" className="mt-4 block text-center text-xs font-semibold" style={{ color: "var(--k-muted)" }}>
              ← Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredMenuItems = menuItems.filter((item) => {
    const q = menuSearch.trim().toLowerCase();
    if (!q) return true;
    const catLabel = item.category_label || CATEGORIES.find((c) => c.id === item.category_id)?.label || "";
    return (
      (item.name || "").toLowerCase().includes(q) ||
      catLabel.toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q)
    );
  });

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    const q = orderSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (o.customer_name || "").toLowerCase().includes(q) ||
      (o.customer_phone || "").toLowerCase().includes(q) ||
      (o.id || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="k-surface min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-10 k-glass-header">
        <div className="k-container flex h-16 items-center justify-between">
          <div>
            <h1 className="font-heading text-lg font-extrabold uppercase tracking-tight" style={{ color: "var(--k-silk)" }}>
              Admin Dashboard
            </h1>
            <p className="text-[11px]" style={{ color: "var(--k-muted)" }}>Kilimandjaro Restaurant</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/orders"
              className="k-focus hidden sm:inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold k-glass-pill"
              style={{ color: "var(--k-silk)" }}
            >
              Track Orders
            </Link>
            <Link
              to="/"
              className="k-focus inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold k-glass-pill"
              style={{ color: "var(--k-silk)" }}
            >
              View Site
            </Link>
          </div>
        </div>
      </header>

      <div className="k-container py-6">
        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <TabButton active={tab === "menu"} onClick={() => setTab("menu")}>Menu Management</TabButton>
          <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>Order Management</TabButton>
          <TabButton active={tab === "settings"} onClick={() => setTab("settings")}>Store Settings</TabButton>
          <TabButton active={tab === "pos"} onClick={() => setTab("pos")}>POS Entry</TabButton>
          <TabButton active={tab === "promos"} onClick={() => setTab("promos")}>Promotions</TabButton>
          <TabButton active={tab === "payouts"} onClick={() => setTab("payouts")}>Payouts</TabButton>
          <TabButton active={tab === "staff"} onClick={() => setTab("staff")}>Staff</TabButton>
        </div>

        {tab === "menu" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-base font-bold" style={{ color: "var(--k-silk)" }}>
                Menu Items ({filteredMenuItems.length})
              </h2>
              <button
                onClick={() => setEditing({})}
                className="k-focus inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold"
                style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Item
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--k-muted)" }} />
              <input
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search menu items by name, category, or description..."
                className="k-input pl-10"
              />
            </div>

            {menuLoading ? (
              <p className="text-sm" style={{ color: "var(--k-muted)" }}>Loading…</p>
            ) : (
              <div className="space-y-3">
                {filteredMenuItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl p-3 k-card">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px]" style={{ color: "var(--k-muted)" }}>No img</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold" style={{ color: "var(--k-silk)" }}>{item.name}</p>
                      <p className="text-xs" style={{ color: "var(--k-muted)" }}>
                        {item.category_label || CATEGORIES.find((c) => c.id === item.category_id)?.label} · ${Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleStock(item)}
                      className="k-focus inline-flex h-9 items-center rounded-full px-3 text-xs font-bold uppercase tracking-wide"
                      style={
                        item.in_stock !== false
                          ? { backgroundColor: "rgba(80,160,90,0.18)", color: "#7fd08a" }
                          : { backgroundColor: "rgba(255,255,255,0.06)", color: "var(--k-muted)" }
                      }
                    >
                      {item.in_stock !== false ? "In Stock" : "Out"}
                    </button>
                    <button
                      onClick={() => setEditing(item)}
                      aria-label="Edit"
                      className="k-focus flex h-9 w-9 items-center justify-center rounded-full k-glass-pill"
                      style={{ color: "var(--k-gold)" }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteItem(item)}
                      aria-label="Delete"
                      className="k-focus flex h-9 w-9 items-center justify-center rounded-full k-glass-pill"
                      style={{ color: "var(--k-terracotta)" }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
                {filteredMenuItems.length === 0 && (
                  <p className="text-sm" style={{ color: "var(--k-muted)" }}>
                    {menuSearch.trim() ? "No items match your search." : "No items yet. Add your first menu item."}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "orders" && (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <TabButton small active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>All</TabButton>
              {ORDER_STATUSES.map((s) => (
                <TabButton key={s} small active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                  {s.replace(/_/g, " ")}
                </TabButton>
              ))}
            </div>

            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--k-muted)" }} />
              <input
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search orders by customer name, phone number, or order ID..."
                className="k-input pl-10"
              />
            </div>

            {ordersLoading ? (
              <p className="text-sm" style={{ color: "var(--k-muted)" }}>Loading…</p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--k-muted)" }}>No orders found.</p>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const canAdvance = order.status !== "completed" && order.status !== "refunded";
                  const needsOutForDelivery = order.order_type === "delivery" && order.status !== "out_for_delivery";
                  return (
                  <div key={order.id} className="rounded-xl p-4 k-card">
                    {/* items — high-contrast, prominently at the top of the card */}
                    <div className="space-y-1">
                      {(order.items || []).map((it, i) => (
                        <p key={i} className="text-white text-lg font-bold">
                          {it.qty}× {it.name}
                          {it.modifiers && Object.keys(it.modifiers).length > 0 && (
                            <span className="text-sm font-semibold" style={{ color: "var(--k-gold)" }}> · {Object.values(it.modifiers).join(" · ")}</span>
                          )}
                        </p>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold" style={{ color: "var(--k-silk)" }}>{order.customer_name}</p>
                        <p className="text-xs" style={{ color: "var(--k-muted)" }}>{order.customer_phone} · {order.pickup_time || "ASAP"}</p>
                        <p className="mt-1 text-xs" style={{ color: "var(--k-muted)" }}>
                          {new Date(order.created_date).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className="inline-block rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
                          style={STATUS_STYLES[order.status] || STATUS_STYLES.pending}
                        >
                          {order.status.replace(/_/g, " ")}
                        </span>
                        <p className="mt-1 text-base font-extrabold" style={{ color: "var(--k-silk)" }}>
                          ${Number(order.total).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {order.refund_requested && order.status !== "refunded" && (
                      <p className="mt-2 text-xs font-semibold" style={{ color: "var(--k-terracotta)" }}>
                        Refund requested — awaiting processing.
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {canAdvance && (
                        <button
                          onClick={() => advanceOrder(order)}
                          className="k-focus inline-flex h-10 items-center rounded-full px-4 text-xs font-bold uppercase tracking-wide"
                          style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}
                        >
                          {needsOutForDelivery ? "Out for Delivery" : "Mark Completed"}
                        </button>
                      )}
                      <label className="text-[11px] font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Status:</label>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order, e.target.value)}
                        className="h-9 rounded-lg px-2 text-xs"
                        style={{ backgroundColor: "var(--k-card)", border: "1px solid var(--k-line)", color: "var(--k-silk)" }}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s} style={{ background: "var(--k-card)" }}>{s.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                      {order.status !== "refunded" && (
                        <button
                          onClick={() => processRefund(order)}
                          className="k-focus ml-auto inline-flex h-10 items-center rounded-full px-4 text-xs font-bold uppercase tracking-wide"
                          style={{ backgroundColor: "rgba(200,90,50,0.15)", color: "var(--k-terracotta)", border: "1px solid var(--k-terracotta)" }}
                        >
                          Process Refund
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "settings" && (
          <div className="max-w-xl space-y-5">
            <div className="rounded-2xl p-5 k-card">
              <h2 className="font-heading text-base font-bold" style={{ color: "var(--k-silk)" }}>Store Hours & Ordering</h2>
              <p className="mt-1 text-xs" style={{ color: "var(--k-muted)" }}>When paused, customer checkout is disabled site-wide.</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Open</label>
                  <input type="time" value={settings?.open_time || "11:00"} onChange={(e) => updateSettings({ open_time: e.target.value })} className="k-input" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Close</label>
                  <input type="time" value={settings?.close_time || "22:00"} onChange={(e) => updateSettings({ close_time: e.target.value })} className="k-input" />
                </div>
              </div>
              <label className="mt-4 flex items-center justify-between rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--k-silk)" }}>Pause incoming orders {settings?.paused ? "(Kitchen closed)" : ""}</span>
                <input type="checkbox" checked={!!settings?.paused} onChange={(e) => updateSettings({ paused: e.target.checked })} className="h-5 w-5" style={{ accentColor: "var(--k-gold)" }} />
              </label>
              <label className="mt-3 flex items-center justify-between rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--k-silk)" }}>Enable pickup</span>
                <input type="checkbox" checked={settings?.pickup_enabled !== false} onChange={(e) => updateSettings({ pickup_enabled: e.target.checked })} className="h-5 w-5" style={{ accentColor: "var(--k-gold)" }} />
              </label>
              <label className="mt-3 flex items-center justify-between rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--k-silk)" }}>Enable delivery</span>
                <input type="checkbox" checked={!!settings?.delivery_enabled} onChange={(e) => updateSettings({ delivery_enabled: e.target.checked })} className="h-5 w-5" style={{ accentColor: "var(--k-gold)" }} />
              </label>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Delivery fee ($)</label>
                  <input type="number" step="0.25" value={settings?.delivery_base_fee ?? 3.99} onChange={(e) => updateSettings({ delivery_base_fee: parseFloat(e.target.value) || 0 })} className="k-input" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Radius (mi)</label>
                  <input type="number" step="0.5" value={settings?.delivery_radius ?? 5} onChange={(e) => updateSettings({ delivery_radius: parseFloat(e.target.value) || 0 })} className="k-input" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-5 k-card">
              <h2 className="font-heading text-base font-bold" style={{ color: "var(--k-silk)" }}>Staff Portal</h2>
              <p className="mt-1 text-xs" style={{ color: "var(--k-muted)" }}>
                Kitchen queue, POS entry, and stock/order management — protected by staff email sign-in.
              </p>
              <Link to="/staff" className="mt-3 inline-block text-xs font-semibold" style={{ color: "var(--k-gold)" }}>Open Staff Portal →</Link>
            </div>

            <div className="rounded-2xl p-5 k-card">
              <h2 className="font-heading text-base font-bold" style={{ color: "var(--k-silk)" }}>Change Master Password</h2>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" className="k-input mt-3" />
              <input type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} placeholder="Confirm new password" className="k-input mt-2" />
              <button
                onClick={() => {
                  if (pw.length >= 4 && pw === pwConfirm) {
                    updateSettings({ master_password: pw }).then(() => { setPw(""); setPwConfirm(""); alert("Master password updated."); });
                  } else {
                    alert("Passwords must match (min 4 characters).");
                  }
                }}
                className="k-focus mt-3 inline-flex h-10 items-center rounded-full px-4 text-sm font-bold"
                style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}
              >
                Update Password
              </button>
            </div>
          </div>
        )}

        {tab === "pos" && (
          <PosPanel menuItems={menuItems} />
        )}

        {tab === "promos" && (
          <PromotionsPanel />
        )}

        {tab === "payouts" && (
          <PayoutsPanel settings={settings} updateSettings={updateSettings} orders={orders} />
        )}

        {tab === "staff" && <StaffPanel />}
      </div>

      {editing && (
        <MenuItemForm
          item={editing}
          onClose={() => { setEditing(null); loadMenu(); }}
          onSaved={api}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, small, children }) {
  return (
    <button
      onClick={onClick}
      className="k-focus rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors"
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