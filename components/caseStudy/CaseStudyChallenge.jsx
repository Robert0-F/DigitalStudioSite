"use client";

import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { useRef } from "react";
import SectionCard from "./SectionCard";
import { fadeInUp } from "@/lib/motion";

export default function CaseStudyChallenge({ caseStudy }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  if (!caseStudy?.challenge) return null;

  return (
    <section ref={ref} className="section-padding pt-10">
      <motion.div variants={fadeInUp} initial="hidden" animate={inView ? "visible" : "hidden"}>
        <SectionCard>
          <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
            Проблема / задача
          </p>
          <h2 className="font-display font-bold text-white text-lg mb-3">
            Что тормозило рост
          </h2>
          <p className="text-[var(--text-muted)] leading-relaxed">
            {caseStudy.challenge}
          </p>
        </SectionCard>
      </motion.div>
    </section>
  );
}

