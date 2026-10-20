import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const DEFAULTS = {
  master_password: "",
  open_time: "11:00",
  close_time: "22:00",
  weekend_close_time: "23:00",
  paused: false,
  pickup_enabled: true,
  delivery_enabled: true,
  delivery_base_fee: 3.99,
  free_delivery_threshold: 50,
  delivery_radius: 5,
  stripe_connected: false,
  stripe_account_id: "",
  twilio_configured: false,
  phone_for_sms: "",
};

let cached = null;
let loadPromise = null;

function getSettings() {
  if (cached) return Promise.resolve(cached);
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const list = await base44.entities.StoreSettings.list("-created_date", 5);
      let rec = list && list[0];
      if (!rec) rec = await base44.entities.StoreSettings.create(DEFAULTS);
      cached = rec;
      return rec;
    } catch (e) {
      return null;
    }
  })();
  return loadPromise;
}

export function useStoreSettings() {
  const [settings, setSettings] = useState(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let active = true;
    getSettings().then((rec) => {
      if (!active) return;
      setSettings(rec);
      setLoading(false);
    });
    const unsub = base44.entities.StoreSettings.subscribe((event) => {
      if (event && (event.type === "create" || event.type === "update")) {
        cached = event.data;
        setSettings(event.data);
      }
    });
    try {
      return () => {
        active = false;
        if (typeof unsub === "function") unsub();
      };
    } catch {
      return () => { active = false; };
    }
  }, []);

  const update = useCallback(async (patch) => {
    if (!cached) return;
    const updated = await base44.entities.StoreSettings.update(cached.id, patch);
    cached = updated;
    setSettings(updated);
    return updated;
  }, []);

  return { settings, loading, update, reload: () => { cached = null; loadPromise = null; return getSettings(); } };
}