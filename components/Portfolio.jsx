"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { portfolioFilters } from "@/lib/siteContent";
import { enterY, visibleY } from "@/lib/motionSafe";

function matchesFilter(project, filterId) {
  if (filterId === "all") return true;
  const home = String(project?.home_filter || "").trim();
  if (home) return home === filterId;
  const pages = Array.isArray(project?.service_pages) ? project.service_pages : [];
  const cats = Array.isArray(project?.categories) ? project.categories.map((c) => c.slug || c) : [];
  return pages.includes(filterId) || cats.includes(filterId);
}

function PlaceholderCover({ title }) {
  return (
    <div className="flex h-full w-full items-end bg-gradient-to-br from-teal-muted via-cream-200 to-clay-soft p-5">
      <p className="font-display text-sm font-bold text-ink line-clamp-2">{title}</p>
    </div>
  );
}

function ProjectCard({ project, featured = false }) {
  const slug = project?.slug;
  if (!slug) return null;

  return (
    <Link
      href={`/portfolio/${slug}`}
      className={`group surface-card block h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-lift ${
        featured ? "lg:min-h-full" : ""
      }`}
    >
      <div className={`relative overflow-hidden bg-cream-200 ${featured ? "aspect-[16/11] lg:aspect-[16/12]" : "aspect-[16/10]"}`}>
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
        <h3 className={`mt-1 font-display font-bold text-ink group-hover:text-teal ${featured ? "text-xl sm:text-2xl" : "text-lg"}`}>
          {project.title}
        </h3>
        {project.overview_excerpt ? (
          <p className={`mt-2 text-sm text-ink-muted ${featured ? "line-clamp-3" : "line-clamp-2"}`}>
            {project.overview_excerpt}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export default function Portfolio() {
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/portfolio?home=1");
        const json = await res.json();
        if (!alive) return;
        setProjects(json.projects ?? []);
      } catch {
        if (alive) setProjects([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = projects.filter((p) => matchesFilter(p, filter));
  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <section id="work" className="section-y" aria-labelledby="work-heading">
      <div className="section-padding">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Портфолио</p>
            <h2 id="work-heading" className="heading-lg text-ink">
              Смотри, что уже сделано
            </h2>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Фильтр проектов">
            {portfolioFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === f.id
                    ? "bg-teal text-white"
                    : "border border-[var(--border-soft)] bg-[var(--bg-card)] text-ink-muted hover:border-teal hover:text-teal"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="surface-card overflow-hidden lg:col-span-2">
              <div className="aspect-[16/11] animate-pulse bg-cream-200" />
              <div className="space-y-2 p-5">
                <div className="h-3 w-24 rounded bg-cream-200" />
                <div className="h-5 w-2/3 rounded bg-cream-200" />
              </div>
            </div>
            <div className="grid gap-4">
              {[0, 1].map((i) => (
                <div key={i} className="surface-card overflow-hidden">
                  <div className="aspect-[16/10] animate-pulse bg-cream-200" />
                  <div className="space-y-2 p-5">
                    <div className="h-3 w-20 rounded bg-cream-200" />
                    <div className="h-4 w-3/4 rounded bg-cream-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.length ? (
              <motion.div
                key={filter}
                className="mt-10 space-y-4"
                initial={enterY(reduceMotion, 10)}
                animate={visibleY}
                transition={{ duration: 0.3 }}
              >
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <ProjectCard project={featured} featured />
                  </div>
                  <div className="grid gap-4">
                    {rest.slice(0, 2).map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                    {!rest.length ? (
                      <div className="surface-muted flex items-center p-6 text-sm text-ink-muted">
                        Добавьте ещё кейсы в админке — сетка заполнится.
                      </div>
                    ) : null}
                  </div>
                </div>
                {rest.length > 2 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.slice(2).map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : null}
              </motion.div>
            ) : (
              <p className="mt-8 text-sm text-ink-muted">Пока нет опубликованных кейсов в этой категории.</p>
            )}
          </AnimatePresence>
        )}

        <div className="mt-8">
          <Link href="/portfolio" className="text-sm font-semibold text-teal link-underline">
            Все проекты →
          </Link>
        </div>
      </div>
    </section>
  );
}
