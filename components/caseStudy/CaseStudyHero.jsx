"use client";

import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { staggerContainer, fadeInUp } from "@/lib/motion";

export default function CaseStudyHero({ caseStudy }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const heroImage = useMemo(() => {
    return caseStudy?.heroImage || null;
  }, [caseStudy]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="absolute inset-0 hero-mesh opacity-80" aria-hidden />

      <div className="section-padding relative">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <motion.div variants={fadeInUp}>
              <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
                {caseStudy?.industry || "Индустрия"} · {caseStudy?.category || "Проект"}
              </p>

              <h1 className="heading-xl font-display font-extrabold tracking-tight text-white mb-5">
                {caseStudy?.title}
              </h1>

              {caseStudy?.valueStatement ? (
                <p className="text-lg leading-relaxed text-[#9ca3af] max-w-xl">
                  {caseStudy.valueStatement}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {Array.isArray(caseStudy?.tags) && caseStudy.tags.length ? (
                  caseStudy.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-display font-semibold text-[#9ca3af]"
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[#71717a]">
                    Премиальный проект под ключ
                  </span>
                )}
              </div>

              {caseStudy?.liveUrl ? (
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href={caseStudy.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/25 px-6 py-3 text-sm font-display font-semibold text-white hover:bg-[#6366f1]/15 transition-colors"
                  >
                    Сайт вживую
                  </Link>
                  <span className="text-xs text-[#71717a]">
                    Проверяем сценарии, дизайн и надёжность
                  </span>
                </div>
              ) : null}
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="lg:pl-2"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c12] glass-luxury">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />
              <div className="relative aspect-[16/10] w-full">
                {heroImage?.src ? (
                  <Image
                    src={heroImage.src}
                    alt={heroImage.alt || caseStudy?.title || "Проект"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 96vw, 640px"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-white/[0.03]" />
                )}
              </div>

              <div className="absolute left-5 bottom-5 right-5 flex flex-col gap-2">
                <div className="w-fit rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-display font-semibold uppercase tracking-wider text-[#a5b4fc]">
                  Демо-макет
                </div>
                <div className="text-sm text-[#9ca3af] max-w-lg">
                  Скриншот показывает ключевые сценарии и визуальную систему
                  проекта.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

