"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  FileCheck,
  UserCircle,
  Code2,
  CalendarClock,
  Shield,
} from "lucide-react";
import { workingPrinciples } from "@/lib/data";
import { fadeInUp, staggerContainer } from "@/lib/motion";

const icons = {
  FileCheck,
  UserCircle,
  Code2,
  CalendarClock,
  Shield,
};

export default function WorkingPrinciples() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section
      ref={ref}
      className="border-t border-white/[0.04] bg-gradient-to-b from-[#050508] to-[#08080f] py-24 sm:py-32"
      aria-labelledby="principles-heading"
    >
      <div className="section-padding">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="mb-14 max-w-2xl lg:mb-16"
        >
          <motion.p
            variants={fadeInUp}
            className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]"
          >
            Как работаем
          </motion.p>
          <motion.h2
            id="principles-heading"
            variants={fadeInUp}
            className="heading-lg font-display font-bold text-white"
          >
            Стандарты сотрудничества
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-[15px] leading-relaxed text-[#9ca3af]"
          >
            Без лозунгов — только то, что фиксируем в процессе и что влияет на
            предсказуемость результата.
          </motion.p>
        </motion.div>

        <motion.ul
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {workingPrinciples.map((item) => {
            const Icon = icons[item.icon] ?? FileCheck;
            return (
              <motion.li key={item.id} variants={fadeInUp}>
                <article className="glass-luxury h-full rounded-2xl border border-white/[0.06] p-6 transition-all duration-400 hover:border-[#6366f1]/18 sm:p-7">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#6366f1]/15 bg-[#6366f1]/[0.07] text-[#a5b4fc]">
                    <Icon className="h-5 w-5" strokeWidth={1.35} aria-hidden />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#9ca3af]">
                    {item.description}
                  </p>
                </article>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
