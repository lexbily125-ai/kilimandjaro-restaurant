import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Truck } from "lucide-react";

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function PayoutsPanel({ settings, updateSettings, orders }) {
  const [extLogs, setExtLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ log_date: new Date().toISOString().slice(0, 10), platform: "Uber Eats", gross: "", fees: "", order_count: "", notes: "" });

  const loadExt = useCallback(async () => {
    try { const list = await base44.entities.ExternalRevenueLog.list("-log_date", 200); setExtLogs(list || []); }
    catch { setExtLogs([]); }
  }, []);

  useEffect(() => {
    loadExt();
    const unsub = base44.entities.ExternalRevenueLog.subscribe(() => loadExt());
    return () => { if (typeof unsub === "function") unsub(); };
  }, [loadExt]);

  const stats = useMemo(() => {
    const valid = (orders || []).filter((o) => o.status !== "refunded");
    const web = valid.filter((o) => (o.order_source || "web") === "web").reduce((s, o) => s + Number(o.total || 0), 0);
    const pos = valid.filter((o) => o.order_source === "pos").reduce((s, o) => s + Number(o.total || 0), 0);
    const extGross = extLogs.reduce((s, l) => s + Number(l.gross || 0), 0);
    const extFees = extLogs.reduce((s, l) => s + Number(l.fees || 0), 0);
    const masterGross = web + pos + extGross;
    const processingFees = valid.reduce((s, o) => { const t = Number(o.total || 0); return s + Math.min(t * 0.029 + 0.3, t); }, 0);
    const tips = valid.reduce((s, o) => s + Number(o.tip || 0), 0);
    return { web, pos, extGross, extFees, masterGross, processingFees, tips, count: valid.length, extCount: extLogs.length };
  }, [orders, extLogs]);

  const addLog = async () => {
    if (!form.log_date || !form.gross) return;
    const gross = Number(form.gross) || 0;
    const fees = Number(form.fees) || 0;
    await base44.entities.ExternalRevenueLog.create({
      log_date: form.log_date,
      platform: form.platform.trim() || "Uber Eats",
      gross,
      fees,
      net: Math.max(gross - fees, 0),
      order_count: Number(form.order_count) || 0,
      notes: form.notes.trim(),
    });
    setForm({ log_date: new Date().toISOString().slice(0, 10), platform: "Uber Eats", gross: "", fees: "", order_count: "", notes: "" });
    setShowForm(false);
  };

  const removeLog = async (l) => { if (window.confirm("Delete this revenue log?")) await base44.entities.ExternalRevenueLog.delete(l.id); };

  const connectBank = () => {
    if (settings?.stripe_connected) return;
    updateSettings({ stripe_connected: true, stripe_account_id: "acct_" + Math.random().toString(36).slice(2, 10) }).then(() => alert("Bank account connected (demo). Real Stripe Connect requires a Builder+ plan."));
  };

  const Metric = ({ label, value, hint, accent }) => (
    <div className="rounded-2xl p-4 k-card">
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>{label}</p>
      <p className="mt-1 font-heading text-2xl font-extrabold" style={{ color: accent || "var(--k-silk)" }}>{value}</p>
      {hint && <p className="mt-1 text-[11px]" style={{ color: "var(--k-muted)" }}>{hint}</p>}
    </div>
  );

  return (
    <div className="max-w-3xl space-y-5">
      {/* Master gross + breakdown */}
      <div className="rounded-2xl p-5 k-card" style={{ background: "linear-gradient(135deg, rgba(225,173,1,0.12), rgba(200,90,50,0.10))" }}>
        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>Master Gross Revenue</p>
        <p className="font-heading text-3xl font-extrabold" style={{ color: "var(--k-gold)" }}>{fmt(stats.masterGross)}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div><span style={{ color: "var(--k-muted)" }}>Direct Web:</span> <span className="font-bold" style={{ color: "var(--k-silk)" }}>{fmt(stats.web)}</span></div>
          <div><span style={{ color: "var(--k-muted)" }}>In-Person POS:</span> <span className="font-bold" style={{ color: "var(--k-silk)" }}>{fmt(stats.pos)}</span></div>
          <div><span style={{ color: "var(--k-muted)" }}>Uber Eats:</span> <span className="font-bold" style={{ color: "var(--k-silk)" }}>{fmt(stats.extGross)}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Processing Fees" value={fmt(stats.processingFees)} hint="est. 2.9% + $0.30" accent="var(--k-terracotta)" />
        <Metric label="Platform Fees" value={fmt(stats.extFees)} hint="Uber Eats etc." accent="var(--k-terracotta)" />
        <Metric label="Tips Collected" value={fmt(stats.tips)} accent="var(--k-gold)" />
        <Metric label="Net Payout Balance" value={fmt(Math.max(stats.masterGross - stats.processingFees - stats.extFees, 0))} hint="available to transfer" />
      </div>

      {/* Bank account */}
      <div className="rounded-2xl p-5 k-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-base font-bold" style={{ color: "var(--k-silk)" }}>Merchant Bank Account</h2>
            <p className="mt-1 text-xs" style={{ color: "var(--k-muted)" }}>
              {settings?.stripe_connected ? `Connected · account ${settings?.stripe_account_id || ""}` : "Connect your bank for daily rolling deposits."}
            </p>
          </div>
          <button onClick={connectBank} disabled={settings?.stripe_connected} className="k-focus inline-flex h-10 items-center rounded-full px-5 text-sm font-bold uppercase tracking-wide disabled:opacity-50" style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}>
            {settings?.stripe_connected ? "Connected" : "Connect Bank Account"}
          </button>
        </div>
        <p className="mt-3 text-[11px]" style={{ color: "var(--k-muted)" }}>Live Stripe Connect / Square onboarding is available on a Builder+ plan.</p>
      </div>

      {/* External Revenue Logger */}
      <div className="rounded-2xl p-5 k-card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-sm font-bold" style={{ color: "var(--k-silk)" }}>External Revenue Logger</h3>
            <p className="text-[11px]" style={{ color: "var(--k-muted)" }}>Manually log daily Uber Eats (or other marketplace) dashboard totals.</p>
          </div>
          <button onClick={() => setShowForm((s) => !s)} className="k-focus inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-bold uppercase tracking-wide" style={{ background: "var(--k-gold)", color: "var(--k-surface)" }}>
            <Plus className="h-3.5 w-3.5" /> Log Entry
          </button>
        </div>

        {showForm && (
          <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Date</label>
              <input type="date" value={form.log_date} onChange={(e) => setForm({ ...form, log_date: e.target.value })} className="k-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Platform</label>
              <input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="k-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Gross ($)</label>
              <input type="number" step="0.01" value={form.gross} onChange={(e) => setForm({ ...form, gross: e.target.value })} placeholder="0.00" className="k-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Platform Fees ($)</label>
              <input type="number" step="0.01" value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} placeholder="0.00" className="k-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Order Count</label>
              <input type="number" value={form.order_count} onChange={(e) => setForm({ ...form, order_count: e.target.value })} className="k-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Notes</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="k-input" />
            </div>
            <div className="col-span-2 flex gap-2">
              <button onClick={addLog} className="k-focus inline-flex h-10 items-center rounded-full px-5 text-sm font-bold uppercase" style={{ background: "var(--k-gold)", color: "var(--k-surface)" }}>Save Log</button>
              <button onClick={() => setShowForm(false)} className="k-focus inline-flex h-10 items-center rounded-full px-5 text-sm font-bold uppercase" style={{ background: "rgba(255,255,255,0.06)", color: "var(--k-muted)" }}>Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {extLogs.length === 0 && <p className="text-xs" style={{ color: "var(--k-muted)" }}>No external revenue logged yet.</p>}
          {extLogs.map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-lg px-2 py-2 text-xs" style={{ color: "var(--k-muted)" }}>
              <span className="flex items-center gap-2"><Truck className="h-3.5 w-3.5" style={{ color: "var(--k-gold)" }} /> {l.log_date} · {l.platform} {l.order_count ? `(${l.order_count} orders)` : ""}</span>
              <span className="flex items-center gap-3">
                <span>Gross <b style={{ color: "var(--k-silk)" }}>{fmt(l.gross)}</b></span>
                <span>Net <b style={{ color: "var(--k-gold)" }}>{fmt(l.net)}</b></span>
                <button onClick={() => removeLog(l)} aria-label="Delete" className="k-focus" style={{ color: "var(--k-terracotta)" }}><Trash2 className="h-3.5 w-3.5" /></button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}