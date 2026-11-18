import { brand, services } from "@/lib/siteContent";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export default function JsonLd() {
  const base = siteUrl();
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: base,
    email: brand.email,
    telephone: brand.phoneTel,
    sameAs: [brand.telegramUrl].filter(Boolean),
  };

  const offerCatalog = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Услуги",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.title,
        description: s.outcome,
        url: `${base}${s.href}`,
        provider: { "@type": "Organization", name: brand.name },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalog) }}
      />
    </>
  );
}
