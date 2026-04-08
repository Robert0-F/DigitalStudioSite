import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceHero from "@/components/services/ServiceHero";
import ServiceOverview from "@/components/services/ServiceOverview";
import ServiceWhatWeDo from "@/components/services/ServiceWhatWeDo";
import ServiceProcess from "@/components/services/ServiceProcess";
import ServiceShowcaseGrid from "@/components/services/ServiceShowcaseGrid";
import ServiceCaseCards from "@/components/services/ServiceCaseCards";
import ServiceWhy from "@/components/services/ServiceWhy";
import ServiceBottomForm from "@/components/services/ServiceBottomForm";
import { metaBySlug, servicePages } from "@/lib/servicePagesData";

const d = servicePages.brand;

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
      image: p.hero_image_url || "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
      href: `/portfolio/${p.slug}`,
    }));
}

export async function generateMetadata() {
  const m = metaBySlug.brand;
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

export default async function BrandServicePage() {
  const projects = await fetchPublishedProjects();
  const cases = toServiceCases(projects, "brand");
  return (
    <>
      <Header />
      <main>
        <article>
          <ServiceHero {...d.hero} />
          <ServiceOverview text={d.overview} />
          <ServiceWhatWeDo items={d.whatWeDo} />
          <ServiceProcess title={d.processTitle} steps={d.processSteps} />
          <ServiceShowcaseGrid
            items={d.portfolio}
            title="Примеры айдентики"
          />
          <ServiceCaseCards cases={cases} title="Кейсы" />
          <ServiceWhy title={d.whyTitle} bullets={d.why} />
          <ServiceBottomForm
            serviceLabel="Бренд и айдентика"
            note={d.formNote}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
