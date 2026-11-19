"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { mergeSiteSettings } from "@/lib/mergeSiteSettings";

const SiteSettingsContext = createContext(null);

/**
 * SSR-initial settings so hero trust/prices are in the first HTML.
 * Client refresh keeps admin edits without a rebuild.
 */
export function SiteSettingsProvider({ initialSettings, children }) {
  const [settings, setSettings] = useState(
    () => initialSettings || mergeSiteSettings(null)
  );
  const [loaded, setLoaded] = useState(Boolean(initialSettings));

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/site-settings");
        const json = await res.json().catch(() => null);
        if (!alive) return;
        setSettings(mergeSiteSettings(json?.settings || null));
      } catch {
        // keep SSR / defaults
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loaded }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettingsContext() {
  return useContext(SiteSettingsContext);
}
