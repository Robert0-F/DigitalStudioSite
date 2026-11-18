import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import DiscussProjectButton from "@/components/portfolio/DiscussProjectButton";
import ImageGallery from "@/components/portfolio/ImageGallery";
import CreativeWorkJsonLd from "@/components/seo/CreativeWorkJsonLd";
import Button from "@/components/ui/Button";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_DJANGO_URL || "http://localhost:8000";
}

async function fetchPublishedPortfolio() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/portfolio`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    return json?.projects ?? [];
  } catch {
    return [];
  }
}

async function fetchPortfolioDetail(slug) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/portfolio/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    return json?.project ?? null;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const projects = await fetchPublishedPortfolio();
  return (projects ?? []).filter((p) => p?.slug).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await fetchPortfolioDetail(slug);
  if (!project) {
    return { title: "Кейс", description: "Подробности проекта" };
  }
  const title = `${project.title} | Tagirov Digital Studio`;
  const description = String(project.overview || project.problem || project.solution || "")
    .trim()
    .slice(0, 160);
  return {
    title,
    description,
    openGraph: { title, description, type: "article", locale: "ru_RU" },
  };
}

function Section({ title, children }) {
  if (!children) return null;
  return (
    <section className="surface-card p-6 sm:p-8">
      <h2 className="mb-3 font-display text-lg font-bold text-ink">{title}</h2>
      <div className="whitespace-pre-line leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}

export default async function PortfolioDetailPage({ params }) {
  const { slug } = await params;
  const project = await fetchPortfolioDetail(slug);

  if (!project) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-cream-100 pt-28 pb-24">
          <article className="section-padding">
            <h1 className="heading-lg text-ink">Кейс не найден</h1>
            <Link href="/portfolio" className="link-underline mt-6 inline-block text-sm text-teal">
              ← К портфолио
            </Link>
          </article>
        </main>
        <Footer />
      </>
    );
  }

  const techTags = String(project.technologies || "")
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <CreativeWorkJsonLd project={project} />
      <Header />
      <main id="main-content" className="bg-cream-100 pb-24 pt-28">
        <article>
          <div className="section-padding">
            <Link href="/portfolio" className="link-underline text-sm text-ink-muted hover:text-teal">
              ← К портфолио
            </Link>
          </div>

          <section className="mt-6">
            {project.case_hero_image_url || project.hero_image_url ? (
              <div className="relative mx-auto aspect-[21/9] max-w-[1400px] overflow-hidden bg-cream-200 sm:rounded-[18px] sm:border sm:border-[var(--border-soft)]">
                <Image
                  src={project.case_hero_image_url || project.hero_image_url}
                  alt={project.title}
                  fill
                  className="object-cover object-top"
                  sizes="100vw"
                  priority
                  quality={90}
                />
              </div>
            ) : (
              <div className="mx-auto aspect-[21/9] max-w-[1400px] bg-gradient-to-br from-teal-muted via-cream-200 to-clay-soft sm:rounded-[18px]" />
            )}
          </section>

          <div className="section-padding mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal">
              {project.client_industry || "Кейс"}
            </p>
            <h1 className="heading-xl mt-2 max-w-4xl text-ink">{project.title}</h1>
            {project.subtitle ? <p className="mt-3 max-w-2xl text-lg text-ink-muted">{project.subtitle}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {project.live_url ? (
                <Button
                  as="a"
                  href={project.live_url}
                  variant="secondary"
                  className="gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Смотреть живой проект
                  <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </Button>
              ) : null}
              {project.video_url ? (
                <Button
                  as="a"
                  href={project.video_url}
                  variant="ghost"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Смотреть видео / демо
                </Button>
              ) : null}
            </div>

            <div className="mt-10 space-y-5">
              <Section title="Задача клиента">{project.problem || project.overview}</Section>
              <Section title="Что сделал">{project.solution}</Section>

              {techTags.length ? (
                <section className="surface-card p-6 sm:p-8">
                  <h2 className="mb-4 font-display text-lg font-bold text-ink">Стек и инструменты</h2>
                  <ul className="flex flex-wrap gap-2">
                    {techTags.map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-[var(--border-soft)] bg-cream-50 px-3 py-1 text-sm text-ink"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <Section title="Результат">{project.results || project.final}</Section>

              {Array.isArray(project.images) && project.images.length ? (
                <section className="surface-card p-6 sm:p-8">
                  <h2 className="mb-6 font-display text-lg font-bold text-ink">Галерея</h2>
                  <ImageGallery images={project.images} projectTitle={project.title} />
                </section>
              ) : null}

              {project.process ? <Section title="Процесс">{project.process}</Section> : null}
            </div>

            <section className="mt-10 rounded-[18px] border border-teal/20 bg-[var(--bg-card)] p-6 shadow-soft sm:p-8">
              <h2 className="font-display text-xl font-bold text-ink">Хотите так же?</h2>
              <p className="mt-3 max-w-2xl text-ink-muted">
                Расскажите о задаче — предложу формат работы и ориентир по срокам без давления.
              </p>
              <div className="mt-6">
                <DiscussProjectButton />
              </div>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
