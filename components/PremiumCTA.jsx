"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import Button from "./ui/Button";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export default function PremiumCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-y border-white/[0.05] py-24 sm:py-32"
      aria-labelledby="premium-cta-heading"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/[0.07] via-transparent to-[#8b5cf6]/[0.05]" />
      <div className="section-padding relative">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.p
            variants={fadeInUp}
            className="mb-4 text-xs font-display font-semibold uppercase tracking-[0.28em] text-[#a5b4fc]"
          >
            Для тех, кто строит на годы вперёд
          </motion.p>
          <motion.h2
            id="premium-cta-heading"
            variants={fadeInUp}
            className="heading-lg mb-6 font-display font-bold text-white"
          >
            Цифровые системы под ваши процессы: прозрачная архитектура,
            согласованные сроки и возможность развивать решение без переделок с
            нуля.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mb-10 text-lg font-light leading-relaxed text-[#9ca3af]"
          >
            Без шаблонных «пакетов». Только архитектура под ваш процесс, прозрачная
            коммуникация и код, который можно развивать.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Button
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="group"
            >
              Запросить стратегическую сессию
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
