"use client";

import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { useRef } from "react";
import SectionCard from "./SectionCard";
import { fadeInUp } from "@/lib/motion";

function StackPills({ items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((t) => (
        <span
          key={t}
          className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-display font-semibold text-[#9ca3af]"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

export default function CaseStudyTechStack({ caseStudy }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const tech = caseStudy?.technologies || null;

  if (!tech) return null;

  return (
    <section ref={ref} className="section-padding pt-10">
      <motion.div variants={fadeInUp} initial="hidden" animate={inView ? "visible" : "hidden"}>
        <SectionCard>
          <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
            Технологии
          </p>
          <h2 className="font-display font-bold text-white text-lg mb-6">
            Фронтенд, бэкенд и интеграции
          </h2>

          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <h3 className="mb-3 text-sm font-display font-bold text-white">
                Фронтенд
              </h3>
              <StackPills items={tech.frontend} />
            </div>
            <div>
              <h3 className="mb-3 text-sm font-display font-bold text-white">
                Бэкенд
              </h3>
              <StackPills items={tech.backend} />
            </div>
            <div>
              <h3 className="mb-3 text-sm font-display font-bold text-white">
                Интеграции
              </h3>
              <StackPills items={tech.integrations} />
            </div>
          </div>
        </SectionCard>
      </motion.div>
    </section>
  );
}

