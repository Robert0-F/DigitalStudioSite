import { services } from "@/lib/siteContent";
import { getDjangoServerUrl } from "@/lib/djangoServerUrl";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

async function fetchProjectSlugs() {
  try {
    const res = await fetch(`${getDjangoServerUrl()}/api/portfolio`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    return (json?.projects ?? []).map((p) => p.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const base = siteUrl();
  const now = new Date();
  const staticRoutes = [
    "",
    "/portfolio",
    "/services",
    ...services.map((s) => `/services/${s.slug}`),
  ].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const slugs = await fetchProjectSlugs();
  const projectRoutes = slugs.map((slug) => ({
    url: `${base}/portfolio/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}
