import {
  brand,
  hero as defaultHero,
  trustStrip as defaultTrust,
  services as defaultServices,
  servicesSection as defaultServicesSection,
  pricingPackages as defaultPricing,
  reviews as defaultReviews,
} from "@/lib/siteContent";
import { getDjangoServerUrl } from "@/lib/djangoServerUrl";

/** Merge API site-settings with local defaults (empty API fields keep defaults / TODO_). */
export function mergeSiteSettings(api) {
  const s = api || {};

  const hero = {
    title: s.hero_title || defaultHero.title,
    subtitle: s.hero_subtitle || defaultHero.subtitle,
    primaryCta: s.hero_primary_cta || defaultHero.primaryCta,
    secondaryCta: s.hero_secondary_cta || defaultHero.secondaryCta,
    browserLabel: s.hero_browser_label || "",
    browserUrl: s.hero_browser_url || "",
  };

  const trustStrip = [
    {
      value: s.trust_years_value || defaultTrust[0].value,
      label: s.trust_years_label || defaultTrust[0].label,
    },
    {
      value: s.trust_projects_value || defaultTrust[1].value,
      label: s.trust_projects_label || defaultTrust[1].label,
    },
    {
      value: s.trust_stack_value || defaultTrust[2].value,
      label: s.trust_stack_label || defaultTrust[2].label,
    },
  ];

  const priceMap = {
    tilda: s.price_tilda,
    django: s.price_django,
    agents: s.price_agents,
    telegram: s.price_telegram,
    marketing: s.price_marketing,
  };

  const cardsById = new Map();
  if (Array.isArray(s.services_cards)) {
    for (const card of s.services_cards) {
      if (card?.id) cardsById.set(card.id, card);
    }
  }

  const services = defaultServices.map((svc) => {
    const over = cardsById.get(svc.id) || {};
    return {
      ...svc,
      title: over.title || svc.title,
      outcome: over.outcome || svc.outcome,
      forWhom: over.forWhom || over.for_whom || svc.forWhom,
      priceFrom: priceMap[svc.id] || svc.priceFrom,
    };
  });

  const servicesSection = {
    heading: s.services_heading || defaultServicesSection.heading,
    subtitle: s.services_subtitle || defaultServicesSection.subtitle,
  };

  const packagePrice = {
    start: s.price_start,
    growth: s.price_growth,
    system: s.price_system,
  };

  const pricingPackages = defaultPricing.map((pkg) => ({
    ...pkg,
    price: packagePrice[pkg.id]
      ? `от ${packagePrice[pkg.id]} ₽`
      : pkg.price,
  }));

  const reviews =
    Array.isArray(s.reviews) && s.reviews.length
      ? s.reviews
      : defaultReviews;

  return {
    brand,
    hero,
    trustStrip,
    services,
    servicesSection,
    pricingPackages,
    reviews,
    footerLegal: s.footer_legal || "Самозанятость / ИП — уточняйте при договоре. TODO_LEGAL",
    heroDesktopUrl: s.hero_desktop_image_url || null,
    heroMobileUrl: s.hero_mobile_image_url || null,
    logoUrl: s.logo_image_url || null,
  };
}

/** Server-side fetch (homepage / service pages). Avoids relative /api from Node. */
export async function fetchSiteSettingsServer() {
  try {
    const res = await fetch(`${getDjangoServerUrl()}/api/site-settings`, {
      cache: "no-store",
    });
    if (!res.ok) return mergeSiteSettings(null);
    const json = await res.json().catch(() => null);
    return mergeSiteSettings(json?.settings || null);
  } catch {
    return mergeSiteSettings(null);
  }
}

/** @deprecated Prefer fetchSiteSettingsServer on the server */
export async function fetchSiteSettings() {
  return fetchSiteSettingsServer();
}
