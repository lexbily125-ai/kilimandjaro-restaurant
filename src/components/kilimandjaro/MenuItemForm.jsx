import React, { useState } from "react";
import { CATEGORIES } from "@/data/menu";
import { base44 } from "@/api/base44Client";

export default function MenuItemForm({ item, onClose, onSaved }) {
  const isEdit = !!item?.id;
  const [form, setForm] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price ?? "",
    image: item?.image || "",
    category_id: item?.category_id || CATEGORIES[0].id,
    tag: item?.tag || "",
    approval: item?.approval || "",
    ratings: item?.ratings ?? 0,
    in_stock: item?.in_stock !== false,
    display_order: item?.display_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (res && res.file_url) setForm((f) => ({ ...f, image: res.file_url }));
      else setError("Upload failed — no URL returned.");
    } catch (err) {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.category_id) {
      setError("Name, price and category are required.");
      return;
    }
    setError("");
    setSaving(true);
    const cat = CATEGORIES.find((c) => c.id === form.category_id);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      image: form.image.trim(),
      category_id: form.category_id,
      category_label: cat?.label || "",
      tag: form.tag.trim(),
      approval: form.approval.trim(),
      ratings: Number(form.ratings) || 0,
      in_stock: form.in_stock,
      display_order: Number(form.display_order) || 0,
    };
    try {
      if (isEdit) {
        await onSaved.update(item.id, payload);
      } else {
        await onSaved.create({ ...payload, item_id: "" });
      }
      setSaving(false);
      onClose();
    } catch (e) {
      setSaving(false);
      setError("Could not save. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1700] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit menu item" : "Add menu item"}
    >
      <div
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl sm:max-w-lg sm:rounded-2xl"
        style={{ backgroundColor: "var(--k-card)", border: "1px solid var(--k-line)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--k-line)" }}>
          <h2 className="font-heading text-base font-extrabold uppercase tracking-tight" style={{ color: "var(--k-silk)" }}>
            {isEdit ? "Edit Item" : "Add New Item"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="k-focus flex h-9 w-9 items-center justify-center rounded-full k-glass-pill"
            style={{ color: "var(--k-silk)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-4">
            <Field label="Title">
              <input value={form.name} onChange={set("name")} placeholder="Item name" className="k-input" style={inputStyle} />
            </Field>
            <Field label="Description">
              <textarea value={form.description} onChange={set("description")} rows={2} placeholder="Short description" className="k-input resize-none" style={inputStyle} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price ($)">
                <input type="number" step="0.01" value={form.price} onChange={set("price")} placeholder="0.00" className="k-input" style={inputStyle} />
              </Field>
              <Field label="Category">
                <select value={form.category_id} onChange={set("category_id")} className="k-input" style={{ ...inputStyle, backgroundColor: "var(--k-card)" }}>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: "var(--k-card)" }}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Image URL">
              <input value={form.image} onChange={set("image")} placeholder="https://…" className="k-input" style={inputStyle} />
              <div className="mt-2 flex items-center gap-3">
                <label className="k-focus inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-xs font-bold uppercase tracking-wide" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--k-line)", color: "var(--k-silk)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--k-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {uploading ? "Uploading…" : "Upload from computer"}
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                </label>
                {form.image && <img src={form.image} alt="preview" className="h-10 w-10 rounded-lg object-cover" style={{ border: "1px solid var(--k-line)" }} />}
              </div>
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Tag">
                <input value={form.tag} onChange={set("tag")} placeholder="#1 Liked" className="k-input" style={inputStyle} />
              </Field>
              <Field label="Approval %">
                <input value={form.approval} onChange={set("approval")} placeholder="96%" className="k-input" style={inputStyle} />
              </Field>
              <Field label="Ratings">
                <input type="number" value={form.ratings} onChange={set("ratings")} placeholder="0" className="k-input" style={inputStyle} />
              </Field>
            </div>
            <label className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                checked={form.in_stock}
                onChange={(e) => setForm((f) => ({ ...f, in_stock: e.target.checked }))}
                className="h-5 w-5 accent-amber-500"
              />
              <span className="text-sm font-medium" style={{ color: "var(--k-silk)" }}>
                In stock
              </span>
            </label>
            {error && <p className="text-xs" style={{ color: "var(--k-terracotta)" }}>{error}</p>}
          </div>
        </div>

        <div className="px-5 py-4" style={{ borderTop: "1px solid var(--k-line)" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="k-focus flex h-12 w-full items-center justify-center rounded-full text-sm font-bold uppercase tracking-wide transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: "var(--k-gold)", color: "var(--k-surface)" }}
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { color: "var(--k-silk)" };

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--k-muted)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}