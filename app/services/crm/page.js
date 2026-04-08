import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceHero from "@/components/services/ServiceHero";
import ServiceOverview from "@/components/services/ServiceOverview";
import ServiceFeatureGrid from "@/components/services/ServiceFeatureGrid";
import ServiceProcess from "@/components/services/ServiceProcess";
import ServiceTechRow from "@/components/services/ServiceTechRow";
import ServiceCaseCards from "@/components/services/ServiceCaseCards";
import ServiceWhy from "@/components/services/ServiceWhy";
import ServiceBottomForm from "@/components/services/ServiceBottomForm";
import { metaBySlug, servicePages } from "@/lib/servicePagesData";

const d = servicePages.crm;

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_DJANGO_URL || "http://localhost:8000";
}

async function fetchPublishedProjects() {
  const res = await fetch(`${getBaseUrl()}/api/portfolio`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json().catch(() => null);
  return json?.projects ?? [];
}

function toServiceCases(projects, serviceSlug, limit = 6) {
  return (projects ?? [])
    .filter((p) => Array.isArray(p.service_pages) && p.service_pages.includes(serviceSlug))
    .slice(0, limit)
    .map((p) => ({
      title: p.title,
      text: p.overview_excerpt || p.subtitle || p.client_industry || "",
      image: p.hero_image_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
      href: `/portfolio/${p.slug}`,
    }));
}

export async function generateMetadata() {
  const m = metaBySlug.crm;
  return {
    title: m.title,
    description: m.description,
    openGraph: {
      title: m.title,
      description: m.description,
      type: "website",
      locale: "ru_RU",
    },
  };
}

export default async function CrmServicePage() {
  const projects = await fetchPublishedProjects();
  const cases = toServiceCases(projects, "crm");
  return (
    <>
      <Header />
      <main>
        <article>
          <ServiceHero {...d.hero} />
          <ServiceOverview text={d.overview} />
          <ServiceFeatureGrid items={d.features} title="Возможности CRM" />
          <ServiceProcess title={d.processTitle} steps={d.processSteps} />
          <ServiceTechRow tech={d.tech} />
          <ServiceCaseCards cases={cases} title="Пример внедрения" />
          <ServiceWhy title={d.whyTitle} bullets={d.why} />
          <ServiceBottomForm
            serviceLabel="CRM и автоматизация"
            note={d.formNote}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
