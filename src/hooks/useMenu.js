import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { CATEGORIES, MENU } from "@/data/menu";

const fromLive = (r) => ({
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
});

// Built-in restaurant menu, used whenever the live MenuItem list is unavailable or empty.
const BUILT_IN_ITEMS = Object.entries(MENU).flatMap(([categoryId, dishes]) =>
  dishes.map((d, index) => ({
    id: d.id,
    _rid: d.id,
    name: d.name,
    description: d.description || "",
    price: d.price,
    image: d.image || "",
    category_id: categoryId,
    category_label: "",
    tag: d.tag || null,
    approval: d.approval || null,
    ratings: d.ratings || 0,
    in_stock: true,
    display_order: index,
  }))
);

// Loads live menu items from the MenuItem entity and keeps them grouped by
// category in the same shape the customer-facing components expect.
export function useMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let live = [];
    try {
      live = (await base44.entities.MenuItem.list("-created_date", 500)) || [];
    } catch (e) {
      live = [];
    }
    setItems(live.length > 0 ? live.map(fromLive) : BUILT_IN_ITEMS);
    setLoading(false);
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
