"use client";

import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { useRef } from "react";
import SectionCard from "./SectionCard";
import { fadeInUp } from "@/lib/motion";

export default function CaseStudyOverview({ caseStudy }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  if (!caseStudy?.overview) return null;

  return (
    <section ref={ref} className="section-padding pt-16">
      <motion.div variants={fadeInUp} initial="hidden" animate={inView ? "visible" : "hidden"}>
        <SectionCard>
          <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
            Проект: обзор
          </p>
          <h2 className="font-display font-bold text-white text-lg mb-3">
            Контекст и цель
          </h2>
          <p className="text-[var(--text-muted)] leading-relaxed">
            {caseStudy.overview}
          </p>
        </SectionCard>
      </motion.div>
    </section>
  );
}

