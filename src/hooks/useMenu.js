import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { CATEGORIES } from "@/data/menu";

// Loads live menu items from the MenuItem entity and keeps them grouped by
// category in the same shape the customer-facing components expect.
export function useMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const list = await base44.entities.MenuItem.list("-created_date", 500);
      const norm = (list || []).map((r) => ({
        id: r.item_id || r.id,
        _rid: r.id,
        name: r.name,
        description: r.description || "",
        price: Number(r.price) || 0,
        image: r.image || "",
        category_id: r.category_id,
        category_label: r.category_label || "",
        tag: r.tag || null,
        approval: r.approval || null,
        ratings: Number(r.ratings) || 0,
        in_stock: r.in_stock !== false,
        display_order: Number(r.display_order) || 0,
      }));
      setItems(norm);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    let unsub = () => {};
    try {
      unsub = base44.entities.MenuItem.subscribe(() => load());
    } catch (e) {
      /* subscribe optional */
    }
    return unsub;
  }, [load]);

  const menuByCategory = {};
  CATEGORIES.forEach((c) => (menuByCategory[c.id] = []));
  [...items]
    .sort((a, b) => a.display_order - b.display_order)
    .forEach((it) => {
      if (menuByCategory[it.category_id]) menuByCategory[it.category_id].push(it);
    });

  return { menuByCategory, loading, refetch: load };
}