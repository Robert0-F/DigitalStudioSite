"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Search,
  Map,
  Palette,
  Code2,
  Rocket,
} from "lucide-react";
import { processSteps } from "@/lib/data";
import { fadeInUp, staggerContainer } from "@/lib/motion";

const icons = { Search, Map, Palette, Code2, Rocket };

export default function Process() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="process"
      ref={ref}
      className="border-t border-white/[0.04] bg-[#050508] py-24 sm:py-32"
      aria-labelledby="process-heading"
    >
      <div className="section-padding">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-16 max-w-2xl text-center sm:mb-20 lg:text-left lg:max-w-none"
        >
          <motion.p
            variants={fadeInUp}
            className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]"
          >
            Прозрачный процесс
          </motion.p>
          <motion.h2
            id="process-heading"
            variants={fadeInUp}
            className="heading-lg font-display font-bold text-white"
          >
            От постановки задачи до релиза — по понятным этапам
          </motion.h2>
        </motion.div>

        <div className="hidden lg:block">
          <motion.ol
            className="relative flex justify-between gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <div
              className="absolute top-[28px] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent"
              aria-hidden
            />
            {processSteps.map((step) => {
              const Icon = icons[step.icon];
              return (
                <motion.li
                  key={step.title}
                  variants={fadeInUp}
                  className="relative flex-1 flex flex-col items-center text-center px-2"
                >
                  <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#6366f1]/25 bg-[#6366f1]/[0.08] text-[#a5b4fc] shadow-glow-sm">
                    <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                  </div>
                  <h3 className="font-display font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="max-w-[220px] text-sm leading-relaxed text-[#9ca3af]">
                    {step.description}
                  </p>
                </motion.li>
              );
            })}
          </motion.ol>
        </div>

        <motion.ol
          className="lg:hidden space-y-0 pl-2"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {processSteps.map((step, index) => {
            const Icon = icons[step.icon];
            const isLast = index === processSteps.length - 1;
            return (
              <motion.li
                key={step.title}
                variants={fadeInUp}
                className="relative flex gap-5 pb-10 last:pb-0"
              >
                {!isLast && (
                  <div
                    className="absolute left-[27px] top-14 bottom-0 w-px bg-gradient-to-b from-[var(--accent)]/50 to-transparent"
                    aria-hidden
                  />
                )}
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#6366f1]/25 bg-[#6366f1]/[0.08] text-[#a5b4fc]">
                  <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                </div>
                <div className="pt-1">
                  <h3 className="font-display font-bold text-lg text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-[#9ca3af]">
                    {step.description}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </section>
  );
}
