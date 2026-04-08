"use client";

import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { useRef } from "react";
import SectionCard from "./SectionCard";
import { fadeInUp } from "@/lib/motion";

export default function CaseStudyFinalCTA({ caseStudy }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const cta = caseStudy?.cta || null;

  const onDiscuss = () => {
    // LeadModal в вашем header слушает эти события.
    window.dispatchEvent(new CustomEvent("lead-modal:open"));
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={ref} className="section-padding pt-10">
      <motion.div variants={fadeInUp} initial="hidden" animate={inView ? "visible" : "hidden"}>
        <SectionCard className="p-0 overflow-hidden">
          <div className="p-6 sm:p-10 bg-[#0c0c12] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/12 via-transparent to-transparent" aria-hidden />
            <div className="relative">
              <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
                Следующий шаг
              </p>
              <h2 className="heading-md font-display font-bold text-white mb-4">
                {cta?.title || "Обсудим ваш проект"}
              </h2>
              {cta?.description ? (
                <p className="text-[var(--text-muted)] leading-relaxed max-w-2xl">
                  {cta.description}
                </p>
              ) : (
                <p className="text-[var(--text-muted)] leading-relaxed max-w-2xl">
                  Расскажите о задачах — мы предложим структуру решения и план работ.
                </p>
              )}

              <div className="mt-8">
                <button
                  type="button"
                  onClick={onDiscuss}
                  className="inline-flex items-center justify-center rounded-xl bg-[#6366f1] px-7 py-3 text-sm font-display font-semibold text-white hover:bg-[#4f46e5] transition-colors shadow-glow-sm"
                >
                  Обсудить ваш проект
                </button>
              </div>

              <p className="mt-5 text-xs text-[#71717a]">
                Без давления: сначала уточняем контекст, затем согласуем реалистичные этапы.
              </p>
            </div>
          </div>
        </SectionCard>
      </motion.div>
    </section>
  );
}

