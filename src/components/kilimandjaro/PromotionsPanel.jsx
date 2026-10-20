import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Tag, Power } from "lucide-react";

const TYPE_LABEL = { percent: "% off", flat: "$ off" };

export default function PromotionsPanel() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", discount_type: "percent", value: "", min_subtotal: "0", max_uses: "0", description: "" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const list = await base44.entities.Promotion.list("-created_date", 200);
      setPromos(list || []);
    } catch { setPromos([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const unsub = base44.entities.Promotion.subscribe(() => load());
    return () => { if (typeof unsub === "function") unsub(); };
  }, [load]);

  const create = async () => {
    if (!form.code.trim() || !form.value) { setError("Code and value are required."); return; }
    setError("");
    try {
      await base44.entities.Promotion.create({
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        value: Number(form.value) || 0,
        min_subtotal: Number(form.min_subtotal) || 0,
        max_uses: Number(form.max_uses) || 0,
        description: form.description.trim(),
        active: true,
        uses: 0,
      });
      setForm({ code: "", discount_type: "percent", value: "", min_subtotal: "0", max_uses: "0", description: "" });
      setShowForm(false);
    } catch (e) { setError("Could not create promo code."); }
  };

  const toggle = async (p) => { await base44.entities.Promotion.update(p.id, { active: !p.active }); };
  const remove = async (p) => { if (window.confirm(`Delete promo ${p.code}?`)) await base44.entities.Promotion.delete(p.id); };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-base font-bold" style={{ color: "var(--k-silk)" }}>Promotions</h2>
          <p className="mt-1 text-xs" style={{ color: "var(--k-muted)" }}>Create percentage or flat-rate codes customers apply at checkout (e.g. DIRECT15).</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="k-focus inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold uppercase tracking-wide" style={{ background: "var(--k-gold)", color: "var(--k-surface)" }}>
          <Plus className="h-4 w-4" /> New Code
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl p-5 k-card">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Code</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="DIRECT15" className="k-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Type</label>
              <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="k-input" style={{ backgroundColor: "var(--k-card)" }}>
                <option value="percent" style={{ background: "var(--k-card)" }}>Percent (%)</option>
                <option value="flat" style={{ background: "var(--k-card)" }}>Flat ($)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Value</label>
              <input type="number" step="0.5" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="15" className="k-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Min subtotal ($)</label>
              <input type="number" value={form.min_subtotal} onChange={(e) => setForm({ ...form, min_subtotal: e.target.value })} className="k-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Max uses (0=∞)</label>
              <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} className="k-input" />
            </div>
            <div className="col-span-2 sm:col-span-3">
              <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: "var(--k-muted)" }}>Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="15% off direct orders" className="k-input" />
            </div>
          </div>
          {error && <p className="mt-2 text-xs" style={{ color: "var(--k-terracotta)" }}>{error}</p>}
          <div className="mt-3 flex gap-2">
            <button onClick={create} className="k-focus inline-flex h-10 items-center rounded-full px-5 text-sm font-bold uppercase" style={{ background: "var(--k-gold)", color: "var(--k-surface)" }}>Create Code</button>
            <button onClick={() => setShowForm(false)} className="k-focus inline-flex h-10 items-center rounded-full px-5 text-sm font-bold uppercase" style={{ background: "rgba(255,255,255,0.06)", color: "var(--k-muted)" }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <p className="text-sm" style={{ color: "var(--k-muted)" }}>Loading…</p> : (
        <div className="space-y-2">
          {promos.length === 0 && <p className="text-sm" style={{ color: "var(--k-muted)" }}>No promo codes yet.</p>}
          {promos.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl p-3 k-card">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: p.active ? "rgba(225,173,1,0.15)" : "rgba(255,255,255,0.06)", color: p.active ? "var(--k-gold)" : "var(--k-muted)" }}>
                <Tag className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold" style={{ color: "var(--k-silk)" }}>{p.code}</p>
                <p className="text-xs" style={{ color: "var(--k-muted)" }}>
                  {p.discount_type === "percent" ? `${p.value}% off` : `$${Number(p.value).toFixed(2)} off`}
                  {(p.min_subtotal || 0) > 0 && ` · min $${p.min_subtotal}`}
                  {(p.max_uses || 0) > 0 && ` · ${p.uses || 0}/${p.max_uses} used`}
                  {(p.max_uses || 0) === 0 && ` · ${p.uses || 0} used`}
                </p>
                {p.description && <p className="text-xs italic" style={{ color: "var(--k-muted)" }}>{p.description}</p>}
              </div>
              <button onClick={() => toggle(p)} className="k-focus inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold uppercase" style={{ background: p.active ? "rgba(80,160,90,0.18)" : "rgba(255,255,255,0.06)", color: p.active ? "#7fd08a" : "var(--k-muted)", border: "1px solid var(--k-line)" }}>
                <Power className="h-3.5 w-3.5" /> {p.active ? "Active" : "Off"}
              </button>
              <button onClick={() => remove(p)} aria-label="Delete" className="k-focus flex h-9 w-9 items-center justify-center rounded-full" style={{ color: "var(--k-terracotta)" }}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}