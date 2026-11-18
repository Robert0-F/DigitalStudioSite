import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

async function fetchPublishedProjects() {
  const base = process.env.NEXT_PUBLIC_DJANGO_URL || "http://localhost:8000";
  try {
    const res = await fetch(`${base}/api/portfolio`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    return json?.projects ?? [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Портфолио",
  description: "Кейсы: сайты на Tilda, Django-системы, Telegram-боты и маркетинг.",
};

function PlaceholderCover({ title }) {
  return (
    <div className="flex h-full w-full items-end bg-gradient-to-br from-teal-muted via-cream-200 to-clay-soft p-5">
      <p className="font-display text-sm font-bold text-ink line-clamp-2">{title}</p>
    </div>
  );
}

function ProjectCard({ project, featured = false }) {
  if (!project?.slug) return null;
  return (
    <article className="h-full">
      <Link
        href={`/portfolio/${project.slug}`}
        className="group surface-card block h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-lift"
      >
        <div
          className={`relative overflow-hidden bg-cream-200 ${
            featured ? "aspect-[16/11] lg:aspect-[16/12]" : "aspect-[16/10]"
          }`}
        >
          {project.hero_image_url ? (
            <Image
              src={project.hero_image_url}
              alt={project.title || "Проект"}
              fill
              className="motion-safe-zoom object-cover"
              sizes={featured ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 640px) 100vw, 33vw"}
              loading="lazy"
            />
          ) : (
            <PlaceholderCover title={project.title} />
          )}
        </div>
        <div className={`p-5 ${featured ? "sm:p-6" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal">
            {project.client_industry || "Проект"}
          </p>
          <h2
            className={`mt-1 font-display font-bold text-ink group-hover:text-teal ${
              featured ? "text-xl sm:text-2xl" : "text-lg"
            }`}
          >
            {project.title}
          </h2>
          {project.overview_excerpt ? (
            <p className={`mt-2 text-sm text-ink-muted ${featured ? "line-clamp-3" : "line-clamp-2"}`}>
              {project.overview_excerpt}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

export default async function PortfolioPage() {
  const projects = await fetchPublishedProjects();
  const featured = projects[0];
  const rest = projects.slice(1);

  return (
    <>
      <Header />
      <main id="main-content" className="bg-cream-100 pt-28 pb-24">
        <section className="section-padding">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Портфолио</p>
          <h1 className="heading-xl max-w-3xl text-ink">Проекты с понятным результатом для бизнеса</h1>
          <p className="mt-4 max-w-2xl text-ink-muted">
            От лендингов до систем и ботов — живые кейсы из админки, без захардкоженного списка.
          </p>

          {projects.length ? (
            <div className="mt-10 space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <ProjectCard project={featured} featured />
                </div>
                <div className="grid gap-4">
                  {rest.slice(0, 2).map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              </div>
              {rest.length > 2 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.slice(2).map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-10 rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-card)] p-8">
              <p className="text-ink-muted">Пока нет опубликованных кейсов. Добавьте их в админ-панели.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
