"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { stats } from "@/lib/data";
import { fadeInUp, staggerContainer } from "@/lib/motion";

/** Вымышленные бренды, монохром, разные отрасли */
const clientLogos = [
  {
    id: "axiom",
    name: "Axiom",
    industry: "ПО и аналитика",
    svg: (
      <g fill="none" stroke="currentColor" strokeWidth="1.15">
        <path d="M14 6 L22 20 H6 Z" opacity="0.9" />
        <line x1="14" y1="12" x2="14" y2="16" opacity="0.5" />
      </g>
    ),
  },
  {
    id: "nexus",
    name: "Nexus",
    industry: "Логистика",
    svg: (
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        <circle cx="10" cy="14" r="3.5" />
        <circle cx="18" cy="8" r="3.5" />
        <circle cx="18" cy="20" r="3.5" />
        <path d="M12.5 12 L16 10 M12.5 16 L16 18 M18 11.5 V16.5" opacity="0.85" />
      </g>
    ),
  },
  {
    id: "vantage",
    name: "Vantage",
    industry: "Финансы",
    svg: (
      <g fill="none" stroke="currentColor" strokeWidth="1.15">
        <path d="M8 18 L14 8 L20 18" />
        <path d="M10 14 H18" opacity="0.4" />
      </g>
    ),
  },
  {
    id: "civic",
    name: "Civic",
    industry: "Медицина",
    svg: (
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        <circle cx="14" cy="14" r="10" opacity="0.35" />
        <path d="M14 9 V19 M9 14 H19" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "omni",
    name: "Omni",
    industry: "Ритейл",
    svg: (
      <g fill="none" stroke="currentColor" strokeWidth="1.05">
        <circle cx="14" cy="14" r="9" opacity="0.3" />
        <circle cx="14" cy="14" r="5.5" opacity="0.45" />
        <circle cx="14" cy="14" r="2" fill="currentColor" opacity="0.25" />
      </g>
    ),
  },
  {
    id: "stratus",
    name: "Stratus",
    industry: "Облачные сервисы",
    svg: (
      <g stroke="currentColor" fill="none" strokeWidth="1.1" strokeLinecap="round">
        <path d="M6 16 Q14 10 22 16" opacity="0.5" />
        <path d="M5 12 Q14 6 23 12" opacity="0.35" />
        <path d="M7 20 Q14 15 21 20" opacity="0.65" />
      </g>
    ),
  },
];

function ClientLogoMark({ brand }) {
  return (
    <div
      className="flex flex-col items-center gap-2 px-2 py-3 opacity-[0.42] transition-all duration-500 hover:opacity-[0.72]"
      aria-hidden
    >
      <svg
        width="40"
        height="28"
        viewBox="0 0 28 28"
        className="shrink-0 text-[#b4b4bc]"
        aria-hidden
      >
        {brand.svg}
      </svg>
      <div className="text-center">
        <p className="font-display text-[13px] font-semibold tracking-wide text-[#d4d4d8]">
          {brand.name}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-[#71717a]">
          {brand.industry}
        </p>
      </div>
    </div>
  );
}

export default function Trust() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="border-t border-white/[0.04] bg-[#08080c] py-24 sm:py-28"
      aria-labelledby="trust-heading"
    >
      <div className="section-padding">
        <div className="glow-line mx-auto mb-14 max-w-md opacity-60" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-16 text-center"
        >
          <motion.h2
            id="trust-heading"
            variants={fadeInUp}
            className="heading-md mb-4 font-display font-bold text-white"
          >
            Цифры и опыт
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto max-w-xl text-[15px] leading-relaxed text-[#9ca3af]"
          >
            Ориентиры по реальному треку проектов. Детали и сроки всегда
            обсуждаем под вашу задачу.
          </motion.p>
        </motion.div>

        <motion.ul
          className="mb-20 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {stats.map((s) => (
            <motion.li
              key={s.label}
              variants={fadeInUp}
              className="group rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#12121a]/90 to-[#0c0c12]/90 p-5 text-center transition-all duration-500 hover:border-[#6366f1]/20 hover:shadow-glow-sm sm:p-7"
            >
              <p className="mb-1.5 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {s.value}
              </p>
              <p className="text-xs leading-snug text-[#71717a] sm:text-[13px]">
                {s.label}
              </p>
            </motion.li>
          ))}
        </motion.ul>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.55 }}
          className="rounded-2xl border border-white/[0.06] bg-[#0a0a10]/80 px-4 py-10 sm:px-10 sm:py-12"
        >
          <p className="mb-8 text-center text-[11px] font-display font-semibold uppercase tracking-[0.2em] text-[#71717a]">
            Команды, с которыми работали
          </p>
          <p className="sr-only">
            Условные обозначения компаний для иллюстрации; не являются
            зарегистрированными товарными знаками.
          </p>
          <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-y-8">
            {clientLogos.map((brand) => (
              <ClientLogoMark key={brand.id} brand={brand} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
