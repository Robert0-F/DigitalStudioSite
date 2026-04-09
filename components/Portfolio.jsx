"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import Image from "next/image";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import Link from "next/link";

const filters = [
  { id: "all", label: "Все" },
  { id: "web", label: "Web и платформы" },
  { id: "crm", label: "CRM автоматизация" },
  { id: "ui-ux", label: "UX UI Design" },
  { id: "brand", label: "Бренд идентика" },
];

const typeLabels = {
  websites: "Сайты",
  landing: "Лендинги",
  ecommerce: "Интернет-магазины",
  crm: "CRM-системы",
  digital_product: "Дизайн",
  branding: "Брендинг",
};

function matchesFilter(project, filterId) {
  if (filterId === "all") return true;
  const homeFilter = String(project?.home_filter || "").trim();
  if (homeFilter) return homeFilter === filterId;
  // Fallback for old records where only service_pages was configured.
  const pages = Array.isArray(project?.service_pages) ? project.service_pages : [];
  return pages.includes(filterId);
}

export default function Portfolio() {
  const [filter, setFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/portfolio");
        const json = await res.json();
        if (!alive) return;
        setProjects(json.projects ?? []);
      } catch {
        // В разработке может не быть БД/ключей — показываем пустой штат без падения.
        if (!alive) return;
        setProjects([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = projects.filter((p) => matchesFilter(p, filter));

  return (
    <section
      id="work"
      ref={ref}
      className="border-y border-white/[0.04] bg-[#060609] py-24 sm:py-32"
      aria-labelledby="work-heading"
    >
      <div className="section-padding">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12"
        >
          <div>
            <motion.p
              variants={fadeInUp}
              className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]"
            >
              Кейсы
            </motion.p>
            <motion.h2
              id="work-heading"
              variants={fadeInUp}
              className="heading-lg font-display font-bold text-white"
            >
              Результаты, а не макеты
            </motion.h2>
          </div>
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Фильтр проектов"
          >
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-4 py-2 text-sm font-display font-semibold transition-all duration-300 ${
                  filter === f.id
                    ? "bg-[#6366f1] text-white shadow-glow-sm"
                    : "border border-white/10 bg-white/[0.03] text-[#9ca3af] hover:border-[#6366f1]/20 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </motion.div>
        </motion.div>

        <motion.ul
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {loading
              ? [...Array(6)].map((_, i) => (
                  <motion.li
                    key={`skeleton-${i}`}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="h-full w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c12]">
                      <div className="relative aspect-[16/10] bg-white/[0.03]" />
                      <div className="p-6">
                        <div className="h-4 w-24 bg-white/[0.04] rounded mb-3" />
                        <div className="h-5 w-3/4 bg-white/[0.05] rounded mb-4" />
                        <div className="h-4 w-5/6 bg-white/[0.03] rounded" />
                      </div>
                    </div>
                  </motion.li>
                ))
              : filtered.map((project) => {
                  const slug = project?.slug;
                  if (!slug) return null;
                  const description =
                    project.overview_excerpt ||
                    (project.overview ? String(project.overview).slice(0, 100) : "");
                  const CardBody = (
                    <div className="group w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c12] text-left shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-[#6366f1]/30 hover:shadow-depth">
                      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-card)]">
                        {project.hero_image_url ? (
                          <Image
                            src={project.hero_image_url}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-white/[0.03]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-400" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="rounded-full bg-white text-[var(--bg-primary)] px-5 py-2.5 text-sm font-display font-bold text-center max-w-[90%]">
                            Смотреть кейс
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="mb-1 text-xs font-display font-semibold uppercase tracking-wider text-[#a5b4fc]">
                          {project.client_industry || typeLabels[project.project_type] || "Проект"}
                        </p>
                        <h3 className="font-display text-lg font-bold text-white transition-colors group-hover:text-[#c7d2fe]">
                          {project.title}
                        </h3>
                        <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-2">
                          {description}
                        </p>
                      </div>
                    </div>
                  );

                  return (
                    <motion.li
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.35 }}
                    >
                      <Link href={`/portfolio/${slug}`} className="block">
                        {CardBody}
                      </Link>
                    </motion.li>
                  );
                })}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}
