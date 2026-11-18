import { brand } from "@/lib/siteContent";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export default function CreativeWorkJsonLd({ project }) {
  if (!project) return null;
  const base = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: String(project.overview || project.problem || "").slice(0, 300),
    url: `${base}/portfolio/${project.slug}`,
    image: project.hero_image_url || undefined,
    creator: { "@type": "Organization", name: brand.name },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
