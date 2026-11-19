import HomeView from "@/components/home/HomeView";
import { fetchSiteSettingsServer } from "@/lib/mergeSiteSettings";

export const dynamic = "force-dynamic";

/**
 * Server-only homepage: no Framer, portals, or client provider.
 * Mobile Safari can show content from HTML+CSS alone (smoke.html proved the network is fine).
 */
export default async function Home() {
  const settings = await fetchSiteSettingsServer();
  return <HomeView settings={settings} />;
}
