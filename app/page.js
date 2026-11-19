import HomeView from "@/components/home/HomeView";
import {
  fetchHomeHeroCovers,
  fetchSiteSettingsServer,
} from "@/lib/mergeSiteSettings";

/** Cache HTML ~1 min — phone refresh stays fast; admin changes appear shortly after. */
export const revalidate = 60;

export default async function Home() {
  const [settings, covers] = await Promise.all([
    fetchSiteSettingsServer({ revalidate: 60 }),
    fetchHomeHeroCovers(),
  ]);
  return <HomeView settings={settings} covers={covers} />;
}
