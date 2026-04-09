import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

import DiscussProjectButton from "@/components/portfolio/DiscussProjectButton";
import ImageGallery from "@/components/portfolio/ImageGallery";

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
    // Important for CI/build servers: don't fail build when API is temporarily unavailable.
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
  return (projects ?? [])
    .filter((p) => p?.slug)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const project = await fetchPortfolioDetail(params.slug);

  if (!project) {
    return {
      title: "Кейс | Tagirov Digital Studio",
      description: "Подробности проекта",
    };
  }

  const title = `${project.title} | Tagirov Digital Studio`;
  const description = String(project.overview || project.problem || project.solution || "")
    .trim()
    .slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ru_RU",
    },
  };
}

function firstNonEmptyLine(text) {
  return String(text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)[0];
}

function parseMultilineToSteps(text) {
  return String(text || "")
    .split(/\n+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function projectTypeLabel(code) {
  const map = {
    websites: "Сайты",
    landing: "Лендинги",
    ecommerce: "Интернет-магазины",
    crm: "CRM-системы",
    digital_product: "Цифровые продукты",
    branding: "Брендинг",
  };
  return code ? map[code] || code : "";
}



export default async function PortfolioDetailPage({ params }) {
  const project = await fetchPortfolioDetail(params.slug);

  if (!project) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#050508] pt-28 pb-24">
          <article className="section-padding">
            <h1 className="heading-lg font-display font-bold text-white">Кейс не найден</h1>
            <p className="mt-4 text-[var(--text-muted)]">Запрос не соответствует существующим кейсам.</p>
            <div className="mt-6">
              <Link href="/portfolio" className="link-underline text-sm text-[#9ca3af] hover:text-white">
                ← Вернуться к портфолио
              </Link>
            </div>
          </article>
        </main>
        <Footer />
      </>
    );
  }

  const valueStatement = firstNonEmptyLine(project.results || project.overview || "");
  const processSteps = parseMultilineToSteps(project.process);
  const projectTypeText = projectTypeLabel(project.project_type);

  return (
    <>
      <Header />
      <main className="bg-[#050508] pt-28 pb-24">
        <article className="section-padding">
          <div className="mb-6">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm text-[#9ca3af] link-underline hover:text-white"
            >
              ← Вернуться к портфолио
            </Link>
          </div>

          {/* Hero */}
          <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c12] p-6 sm:p-8">
            <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
                  {(project.client_industry || projectTypeText || "Проект").trim()}
                </p>
                <h1 className="heading-xl font-display font-extrabold tracking-tight text-white">
                  {project.title}
                </h1>
                {valueStatement ? (
                  <p className="mt-5 text-lg leading-relaxed text-[#9ca3af] max-w-xl">
                    {valueStatement}
                  </p>
                ) : null}

                {project.live_url ? (
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/25 px-6 py-3 text-sm font-display font-semibold text-white hover:bg-[#6366f1]/15 transition-colors"
                    >
                      Сайт вживую
                    </a>
                  </div>
                ) : null}

                {projectTypeText ? (
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-display font-semibold text-[#9ca3af]">
                      {projectTypeText}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="lg:pl-2">
                {project.hero_image_url ? (
                  <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--bg-card)]">
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={project.hero_image_url}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 92vw, 740px"
                        priority
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-60" />
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {/* Text sections */}
          <div className="mt-10 space-y-8">
            {project.overview ? (
              <section className="glass-strong rounded-2xl border border-white/[0.06] p-6 sm:p-8">
                <h2 className="mb-3 text-lg font-display font-bold text-white">🧠 О проекте</h2>
                <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{project.overview}</p>
              </section>
            ) : null}

            {project.problem ? (
              <section className="glass-strong rounded-2xl border border-white/[0.06] p-6 sm:p-8">
                <h2 className="mb-3 text-lg font-display font-bold text-white">⚠️ Проблема</h2>
                <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{project.problem}</p>
              </section>
            ) : null}

            {project.solution ? (
              <section className="glass-strong rounded-2xl border border-white/[0.06] p-6 sm:p-8">
                <h2 className="mb-3 text-lg font-display font-bold text-white">🛠 Решение</h2>
                <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{project.solution}</p>
              </section>
            ) : null}

            {processSteps.length ? (
              <section className="glass-strong rounded-2xl border border-white/[0.06] p-6 sm:p-8">
                <h2 className="mb-6 text-lg font-display font-bold text-white">⚙️ Процесс работы</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {processSteps.map((step, idx) => (
                    <div
                      key={`${step}-${idx}`}
                      className="rounded-2xl border border-white/[0.06] bg-[#0c0c12] p-5 transition-all hover:border-[#6366f1]/25"
                    >
                      <p className="text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
                        Шаг {idx + 1}
                      </p>
                      <p className="mt-2 text-[var(--text-primary)] font-display font-bold text-white">{step}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {project.results ? (
              <section className="glass-strong rounded-2xl border border-white/[0.06] p-6 sm:p-8">
                <h2 className="mb-3 text-lg font-display font-bold text-white">📈 Результат</h2>
                <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{project.results}</p>
              </section>
            ) : null}

            {/* Showcase */}
            {Array.isArray(project.images) && project.images.length ? (
              <section className="glass-strong rounded-2xl border border-white/[0.06] p-6 sm:p-8">
                <h2 className="mb-6 text-lg font-display font-bold text-white">Визуальная часть</h2>
                <ImageGallery images={project.images} projectTitle={project.title} />
              </section>
            ) : null}

            {project.technologies ? (
              <section className="glass-strong rounded-2xl border border-white/[0.06] p-6 sm:p-8">
                <h2 className="mb-3 text-lg font-display font-bold text-white">🧩 Технологии</h2>
                <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{project.technologies}</p>
              </section>
            ) : null}

            {project.final ? (
              <section className="glass-strong rounded-2xl border border-white/[0.06] p-6 sm:p-8">
                <h2 className="mb-3 text-lg font-display font-bold text-white">🔥 Итог</h2>
                <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{project.final}</p>
              </section>
            ) : null}
          </div>

          {/* CTA */}
          <section className="mt-10">
            <div className="glass-strong rounded-2xl border border-white/[0.06] p-6 sm:p-8">
              <h2 className="font-display font-bold text-white text-lg">Следующий шаг</h2>
              <p className="mt-3 text-[var(--text-muted)] leading-relaxed max-w-2xl">
                Расскажите о задаче и контексте вашей компании — подготовим реалистичный план работ и обсудим сценарии
                решения без лишнего давления.
              </p>
              <div className="mt-8">
                <DiscussProjectButton />
              </div>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}

