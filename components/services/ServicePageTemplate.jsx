import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { Check, LayoutTemplate, Database, Bot, Megaphone } from "lucide-react";
import DiscussProjectButton from "@/components/portfolio/DiscussProjectButton";
import IconBox from "@/components/ui/IconBox";
import Button from "@/components/ui/Button";
import { brand } from "@/lib/siteContent";
import { mergeSiteSettings } from "@/lib/mergeSiteSettings";
import { getDjangoServerUrl } from "@/lib/djangoServerUrl";

const icons = {
  tilda: LayoutTemplate,
  django: Database,
  telegram: Bot,
  marketing: Megaphone,
  agents: Database,
};

async function fetchSiteSettingsServer() {
  try {
    const res = await fetch(`${getDjangoServerUrl()}/api/site-settings`, { cache: "no-store" });
    if (!res.ok) return mergeSiteSettings(null);
    const json = await res.json().catch(() => null);
    return mergeSiteSettings(json?.settings || null);
  } catch {
    return mergeSiteSettings(null);
  }
}

async function fetchCases(serviceSlug) {
  try {
    const res = await fetch(`${getDjangoServerUrl()}/api/portfolio`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    const projects = json?.projects ?? [];
    return projects
      .filter((p) => {
        const pages = Array.isArray(p.service_pages) ? p.service_pages : [];
        const home = String(p.home_filter || "");
        const cats = Array.isArray(p.categories) ? p.categories.map((c) => c.slug || c) : [];
        return pages.includes(serviceSlug) || home === serviceSlug || cats.includes(serviceSlug);
      })
      .slice(0, 6);
  } catch {
    return [];
  }
}

function PlaceholderCover({ title }) {
  return (
    <div className="flex h-full w-full items-end bg-gradient-to-br from-teal-muted via-cream-200 to-clay-soft p-4">
      <p className="font-display text-sm font-bold text-ink line-clamp-2">{title}</p>
    </div>
  );
}

export default async function ServicePageTemplate({ service }) {
  const [cases, site] = await Promise.all([fetchCases(service.slug), fetchSiteSettingsServer()]);
  const priced = site.services.find((s) => s.slug === service.slug);
  const priceFrom = priced?.priceFrom || service.priceFrom;
  const Icon = icons[service.slug] || LayoutTemplate;

  return (
    <>
      <Header />
      <main id="main-content" className="bg-cream-100 pb-24 pt-28">
        <section className="section-padding">
          <div className="mb-5 flex items-center gap-3">
            <IconBox>
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </IconBox>
            <p className="chip-accent">{service.title}</p>
          </div>
          <h1 className="heading-xl max-w-3xl text-ink">{service.heroTitle}</h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-muted">{service.heroText}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <DiscussProjectButton />
            <Button as="a" href={brand.telegramUrl} variant="secondary">
              Написать в Telegram
            </Button>
          </div>
        </section>

        <section className="section-padding mt-14">
          <h2 className="heading-md text-ink">Что получите</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {service.outcomes.map((item) => (
              <li key={item} className="surface-card flex items-start gap-3 p-5 text-sm text-ink">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-muted text-teal">
                  <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-semibold text-clay">Ориентир: от {priceFrom} ₽</p>
        </section>

        <section className="section-padding mt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="heading-md text-ink">Кейсы по направлению</h2>
            <Link href="/portfolio" className="link-underline text-sm font-semibold text-teal">
              Все проекты →
            </Link>
          </div>
          {cases.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cases.map((p) => (
                <Link
                  key={p.id}
                  href={`/portfolio/${p.slug}`}
                  className="group surface-card overflow-hidden transition hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative aspect-[16/10] bg-cream-200">
                    {p.hero_image_url ? (
                      <Image
                        src={p.hero_image_url}
                        alt={p.title || "Кейс"}
                        fill
                        className="motion-safe-zoom object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                        loading="lazy"
                      />
                    ) : (
                      <PlaceholderCover title={p.title} />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-teal">
                      {p.client_industry || "Проект"}
                    </p>
                    <h3 className="mt-1 font-display font-bold text-ink group-hover:text-teal">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-muted">
              Пока нет опубликованных кейсов с меткой «{service.slug}». Отметьте проекты в админке (`home_filter` /
              категории).
            </p>
          )}
        </section>

        <section className="section-padding mt-16">
          <div className="rounded-[18px] border border-teal/20 bg-[var(--bg-card)] p-6 shadow-soft sm:p-8">
            <h2 className="font-display text-xl font-bold text-ink">Нужно именно это направление?</h2>
            <p className="mt-3 max-w-2xl text-ink-muted">
              Опишите задачу коротко — отвечу по формату, срокам и ориентиру по бюджету.
            </p>
            <div className="mt-6">
              <DiscussProjectButton />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
