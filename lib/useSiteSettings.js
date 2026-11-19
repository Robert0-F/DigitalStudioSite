"use client";

import { useEffect, useState } from "react";
import { mergeSiteSettings } from "@/lib/mergeSiteSettings";
import { useSiteSettingsContext } from "@/lib/SiteSettingsProvider";

/**
 * Prefer SSR provider data (homepage). Fallback: client fetch for pages
 * outside the provider.
 */
export default function useSiteSettings() {
  const ctx = useSiteSettingsContext();
  const [settings, setSettings] = useState(() => mergeSiteSettings(null));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (ctx) return undefined;
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
  }, [ctx]);

  if (ctx) return ctx;
  return { settings, loaded };
}
