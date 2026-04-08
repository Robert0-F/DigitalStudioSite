"use client";

import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { Fragment, useRef } from "react";
import SectionCard from "./SectionCard";
import { fadeInUp } from "@/lib/motion";

function ProcessStepCard({ index, step }) {
  return (
    <div className="relative flex flex-1 flex-col gap-3 rounded-2xl border border-white/[0.06] bg-[#0c0c12] p-6 glass">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white font-display font-bold">
          {String(index + 1).padStart(2, "0")}
        </div>
        <h3 className="font-display font-bold text-white text-lg">{step.title}</h3>
      </div>
      <p className="text-[var(--text-muted)] leading-relaxed">{step.description}</p>
    </div>
  );
}

export default function CaseStudyProcess({ caseStudy }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const steps = Array.isArray(caseStudy?.process) ? caseStudy.process : [];

  if (!steps.length) return null;

  return (
    <section ref={ref} className="section-padding pt-10">
      <motion.div variants={fadeInUp} initial="hidden" animate={inView ? "visible" : "hidden"}>
        <SectionCard className="p-0 overflow-hidden">
          <div className="p-6 sm:p-8">
            <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
              Процесс
            </p>
            <h2 className="font-display font-bold text-white text-lg mb-6">
              Как мы ведём проект от идеи до запуска
            </h2>

            <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-4">
              {steps.map((s, i) => (
                <Fragment key={s.title || i}>
                  <div className="flex-1">
                    <ProcessStepCard index={i} step={s} />
                  </div>
                  {i < steps.length - 1 ? (
                    <div
                      className="hidden md:block w-px bg-white/[0.08] self-stretch rounded-full"
                      aria-hidden
                    />
                  ) : null}
                </Fragment>
              ))}
            </div>
          </div>
        </SectionCard>
      </motion.div>
    </section>
  );
}

