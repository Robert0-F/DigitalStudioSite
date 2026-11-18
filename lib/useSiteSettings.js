"use client";

import { useEffect, useState } from "react";
import { mergeSiteSettings } from "@/lib/mergeSiteSettings";

export default function useSiteSettings() {
  const [settings, setSettings] = useState(() => mergeSiteSettings(null));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/site-settings");
        const json = await res.json().catch(() => null);
        if (!alive) return;
        setSettings(mergeSiteSettings(json?.settings || null));
      } catch {
        if (alive) setSettings(mergeSiteSettings(null));
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { settings, loaded };
}
