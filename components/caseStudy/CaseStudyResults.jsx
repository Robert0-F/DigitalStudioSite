"use client";

import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { useRef } from "react";
import SectionCard from "./SectionCard";
import { fadeInUp } from "@/lib/motion";

export default function CaseStudyResults({ caseStudy }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const results = Array.isArray(caseStudy?.results) ? caseStudy.results : [];

  if (!results.length) return null;

  return (
    <section ref={ref} className="section-padding pt-10">
      <motion.div variants={fadeInUp} initial="hidden" animate={inView ? "visible" : "hidden"}>
        <SectionCard>
          <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
            Результаты / Влияние
          </p>
          <h2 className="font-display font-bold text-white text-lg mb-6">
            Что изменилось после внедрения
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {results.map((r) => (
              <div
                key={r.metric}
                className="rounded-2xl border border-white/[0.06] bg-[#0c0c12] p-5 transition-all duration-300 hover:border-[#6366f1]/25 hover:shadow-glow-sm"
              >
                <p className="font-display font-extrabold text-white text-2xl leading-none mb-3">
                  {r.metric}
                </p>
                <p className="text-[var(--text-muted)] leading-relaxed">{r.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </motion.div>
    </section>
  );
}

