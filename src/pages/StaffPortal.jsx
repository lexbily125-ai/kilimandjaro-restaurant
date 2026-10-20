import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useAudioAlert } from "@/hooks/useAudioAlert";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import PosPanel from "@/components/kilimandjaro/PosPanel";
import StaffOrderCard from "@/components/kilimandjaro/StaffOrderCard";
import StaffStockOrders from "@/components/kilimandjaro/StaffStockOrders";
import { UtensilsCrossed, PauseCircle, PlayCircle, LayoutGrid, ClipboardList, Package, Loader2 } from "lucide-react";

const ACTIVE = ["pending", "preparing", "out_for_delivery"];
const STAFF_ROLES = ["staff", "chef", "admin"];

function Gate({ title, body, cta }) {
  return (
    <div className="k-surface flex min-h-screen items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        <h1 className="font-heading text-xl font-extrabold" style={{ color: "var(--k-silk)" }}>{title}</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--k-muted)" }}>{body}</p>
        <div className="mt-5">{cta}</div>
      </div>
    </div>
  );
}

export default function StaffPortal() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { settings, update: updateSettings } = useStoreSettings();
  const [view, setView] = useState("queue");
  const [stockTab, setStockTab] = useState("stock");
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const role = (user?.role || "user").toLowerCase();
  const allowed = STAFF_ROLES.includes(role);

  const load = useCallback(async () => {
    try {
      const [ord, menu] = await Promise.all([
        base44.entities.Order.list("-created_date", 150),
        base44.entities.MenuItem.list("-display_order", 500),
      ]);
      setOrders(ord || []);
      setMenuItems(menu || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    load();
    const u1 = base44.entities.Order.subscribe(() => load());
    const u2 = base44.entities.MenuItem.subscribe(() => load());
    return () => {
      if (typeof u1 === "function") u1();
      if (typeof u2 === "function") u2();
    };
  }, [allowed, load]);

  const active = orders.filter((o) => ACTIVE.includes(o.status));
  const needsAck = active.some((o) => !o.chef_acknowledged);
  const { blocked, enableSound, resume: resumeAudio } = useAudioAlert(needsAck);

  // Tablet hardening: no rubber-band overscroll while on the staff board
  useEffect(() => {
    const prev = document.body.style.overscrollBehavior;
    document.body.style.overscrollBehavior = "none";
    return () => { document.body.style.overscrollBehavior = prev; };
  }, []);

  // Live age tick so order cards re-color as they age
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  // Keep the tablet awake; re-acquire the wake lock and resume audio after sleep
  useEffect(() => {
    if (!allowed) return;
    let sentinel = null;
    const acquire = async () => {
      try {
        if ("wakeLock" in navigator && document.visibilityState === "visible") {
          sentinel = await navigator.wakeLock.request("screen");
        }
      } catch { /* unsupported or denied — ignore */ }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        acquire();
        resumeAudio();
      }
    };
    acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      try { if (sentinel) sentinel.release(); } catch { /* noop */ }
      sentinel = null;
    };
  }, [allowed, resumeAudio]);

  const ack = async (order) => {
    const patch = { chef_acknowledged: true };
    if (order.status === "pending") { patch.status = "preparing"; patch.prep_started_at = new Date().toISOString(); }
    await base44.entities.Order.update(order.id, patch);
  };

  const advance = async (order) => {
    await base44.entities.Order.update(order.id, { status: "out_for_delivery", out_for_delivery_at: new Date().toISOString() });
  };

  const complete = async (order) => {
    await base44.entities.Order.update(order.id, { status: "completed", delivered_at: new Date().toISOString() });
  };

  const updateStatus = async (order, status) => {
    await base44.entities.Order.update(order.id, { status });
  };

  const toggleStock = async (item) => {
    const nextInStock = item.in_stock === false;
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? { ...m, in_stock: nextInStock } : m)));
    try {
      await base44.entities.MenuItem.update(item.id, { in_stock: nextInStock });
    } catch {
      load();
    }
  };

  const togglePause = () => updateSettings({ paused: !settings?.paused });

  const printReceipt = (order) => {
    const w = window.open("", "_blank", "width=420");
    if (!w) { alert("Allow popups to print receipts."); return; }
    const rows = (order.items || []).map((it) => {
      const mods = it.modifiers && Object.keys(it.modifiers).length ? `<div style="padding-left:6px;font-size:11px;color:#333">— ${Object.values(it.modifiers).join(", ")}</div>` : "";
      const sp = it.special_instructions ? `<div style="padding-left:6px;font-size:11px;font-style:italic;color:#b33">* ${it.special_instructions}</div>` : "";
      return `<div style="border-bottom:1px dashed #ccc;padding:3px 0"><b>${it.qty}× ${it.name}</b> <span style="float:right">$${(it.price * it.qty).toFixed(2)}</span>${mods}${sp}</div>`;
    }).join("");
    w.document.write(`<html><head><title>Kitchen Receipt #${(order.id || "").slice(-5)}</title><style>@page{size:80mm auto;margin:0}body{font-family:'Courier New',monospace;font-size:12px;width:72mm;margin:3mm auto;color:#000}h2{text-align:center;font-size:14px;margin:2px 0}.muted{font-size:11px;text-align:center}</style></head><body>
        <h2>KILIMANDJARO</h2>
        <div class="muted">4301 Chestnut St, Philadelphia, PA</div>
        <div class="muted">Order #${(order.id || "").slice(-6).toUpperCase()} · ${order.order_type === "delivery" ? "DELIVERY" : "PICKUP"}${order.order_source === "pos" ? " · POS" : ""}</div>
        <div class="muted">${new Date(order.created_date).toLocaleString()}</div>
        <div class="muted">Customer: ${order.customer_name} · ${order.customer_phone || "—"}</div>
        ${order.order_type === "delivery" && order.delivery_address ? `<div class="muted">Deliver to: ${order.delivery_address}</div>` : ""}
        ${order.delivery_notes ? `<div class="muted">Notes: ${order.delivery_notes}</div>` : ""}
        <hr style="border-top:1px solid #000;margin:6px 0"/>
        ${rows}
        <hr style="border-top:1px solid #000;margin:6px 0"/>
        <div>Total: $${Number(order.total).toFixed(2)} · ${order.payment_method === "cash" ? "CASH" : "CARD"}</div>
        <div class="muted" style="margin-top:8px">PREPARE FRESH · THANK YOU</div>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  if (isLoadingAuth) {
    return (
      <div className="k-surface flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--k-gold)" }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Gate
        title="Staff sign-in required"
        body="Sign in with your staff email account to open the Staff Portal."
        cta={<Link to="/login" className="k-focus inline-flex h-12 items-center rounded-full px-6 text-sm font-bold uppercase tracking-wide" style={{ background: "var(--k-gold)", color: "var(--k-surface)" }}>Sign In</Link>}
      />
    );
  }

  if (!allowed) {
    return (
      <Gate
        title="Access restricted"
        body="This portal is for staff accounts only. Ask an admin to grant your account a staff role."
        cta={<Link to="/" className="k-focus inline-flex h-12 items-center rounded-full px-6 text-sm font-bold uppercase tracking-wide k-glass-pill" style={{ color: "var(--k-silk)" }}>Back to site</Link>}
      />
    );
  }

  return (
    <div className="k-surface min-h-screen">
      <header style={{ backgroundColor: "#161412", borderBottom: "1px solid var(--k-line)" }}>
        <div className="k-container flex h-20 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" style={{ color: "var(--k-gold)" }} />
            <h1 className="font-heading text-lg font-extrabold uppercase tracking-tight" style={{ color: "var(--k-silk)" }}>Staff Portal</h1>
            {needsAck && <span className="ml-2 animate-pulse rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: "var(--k-terracotta)", color: "#fff" }}>New Order</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePause}
              className="k-focus inline-flex h-14 items-center gap-2 rounded-full px-5 text-[18px] font-bold uppercase tracking-wide"
              style={{ background: settings?.paused ? "rgba(200,90,50,0.18)" : "rgba(255,255,255,0.06)", border: `1px solid ${settings?.paused ? "var(--k-terracotta)" : "var(--k-line)"}`, color: settings?.paused ? "var(--k-terracotta)" : "var(--k-silk)" }}
            >
              {settings?.paused ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
              {settings?.paused ? "Orders Paused" : "Pause Online Orders"}
            </button>
            <Link to="/" className="k-focus hidden h-14 items-center rounded-full px-5 text-[18px] font-bold uppercase tracking-wide sm:inline-flex" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid var(--k-line)", color: "var(--k-silk)" }}>Site</Link>
          </div>
        </div>
        <div className="k-container flex gap-2 pb-3">
          <TabButton active={view === "queue"} onClick={() => setView("queue")} icon={<ClipboardList className="h-5 w-5" />}>Kitchen Queue</TabButton>
          <TabButton active={view === "pos"} onClick={() => setView("pos")} icon={<LayoutGrid className="h-5 w-5" />}>POS Entry</TabButton>
          <TabButton active={view === "stock"} onClick={() => setView("stock")} icon={<Package className="h-5 w-5" />}>Stock &amp; Orders</TabButton>
        </div>
      </header>

      {needsAck && blocked && (
        <div className="fixed bottom-6 left-1/2 z-[2000] -translate-x-1/2 rounded-full px-5 py-3 text-sm font-bold shadow-xl" style={{ background: "var(--k-terracotta)", color: "#fff" }}>
          🔊 New order alert — <button onClick={enableSound} className="underline">tap to enable sound</button>
        </div>
      )}

      <div className="k-container py-6">
        {view === "pos" ? (
          <PosPanel menuItems={menuItems} />
        ) : view === "stock" ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <SubTab active={stockTab === "stock"} onClick={() => setStockTab("stock")}>
                📦 Stock Management ({menuItems.length})
              </SubTab>
              <SubTab active={stockTab === "orders"} onClick={() => setStockTab("orders")}>
                📋 Order Management ({orders.length})
              </SubTab>
            </div>
            <StaffStockOrders
              section={stockTab}
              menuItems={menuItems}
              onToggleStock={toggleStock}
              orders={orders}
              onUpdateStatus={updateStatus}
            />
          </div>
        ) : loading ? (
          <p className="text-sm" style={{ color: "var(--k-muted)" }}>Loading orders…</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {active.length === 0 && <p className="text-sm" style={{ color: "var(--k-muted)" }}>No active orders. Queue is clear. 👨‍🍳</p>}
            {active.map((order) => (
              <StaffOrderCard
                key={order.id}
                order={order}
                now={now}
                onAck={ack}
                onAdvance={advance}
                onComplete={complete}
                onPrint={printReceipt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SubTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="k-focus inline-flex h-14 items-center rounded-full px-5 text-[16px] font-bold uppercase tracking-wide"
      style={
        active
          ? { background: "rgba(225,173,1,0.16)", border: "1px solid var(--k-gold)", color: "var(--k-gold)" }
          : { background: "rgba(255,255,255,0.05)", border: "1px solid var(--k-line)", color: "var(--k-muted)" }
      }
    >
      {children}
    </button>
  );
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className="k-focus inline-flex h-14 items-center gap-2 rounded-full px-5 text-[18px] font-bold uppercase tracking-wide"
      style={
        active
          ? { background: "var(--k-gold)", color: "var(--k-surface)" }
          : { background: "rgba(255,255,255,0.05)", color: "var(--k-muted)", border: "1px solid var(--k-line)" }
      }
    >
      {icon} {children}
    </button>
  );
}