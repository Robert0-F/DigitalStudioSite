"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "./ui/Button";
import HeroMobileLuxury from "./hero/HeroMobileLuxury";
import { fadeInUp, staggerContainer } from "@/lib/motion";

const HeroWebGL = dynamic(() => import("./hero/HeroWebGL"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#050508]" aria-hidden />
  ),
});

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function openLeadModal() {
  window.dispatchEvent(new CustomEvent("lead-modal:open"));
}

export default function Hero() {
  const [lg, setLg] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const u = () => {
      setLg(mq.matches);
      setReducedMotion(rm.matches);
    };
    u();
    mq.addEventListener("change", u);
    rm.addEventListener("change", u);
    return () => {
      mq.removeEventListener("change", u);
      rm.removeEventListener("change", u);
    };
  }, []);

  return (
    <section
      className="relative min-h-[100svh] overflow-hidden bg-[#050508]"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 z-0">
        {lg ? (
          <HeroWebGL
            reducedMotion={reducedMotion}
            className="absolute inset-0 h-full min-h-[520px] w-full lg:min-h-full"
          />
        ) : (
          <HeroMobileLuxury />
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#050508]/50 via-transparent to-[#050508] lg:bg-gradient-to-r lg:from-[#050508] lg:from-0% lg:via-[#050508]/88 lg:via-42% lg:to-transparent lg:to-100%"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col px-5 pb-24 pt-28 sm:px-8 lg:flex-row lg:items-center lg:px-12 lg:pb-28 lg:pt-32 xl:px-16">
        <div className="flex max-w-xl flex-1 flex-col justify-center lg:max-w-[540px] xl:max-w-xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="glass-luxury rounded-[1.75rem] border border-white/[0.07] px-7 py-9 sm:px-9 sm:py-11"
          >
            <motion.div
              variants={fadeInUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#6366f1]/20 bg-[#6366f1]/5 px-3 py-1"
            >
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#818cf8]"
                aria-hidden
              />
              <span className="text-[11px] font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]">
                Архитектура · Системы · Дизайн
              </span>
            </motion.div>

            <motion.h1
              id="hero-heading"
              variants={fadeInUp}
              className="heading-xl mb-6 font-display font-extrabold tracking-tight text-white"
            >
              Создаём{" "}
              <span className="text-gradient">цифровые продукты</span>
              <br />
              для роста бизнеса
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mb-10 max-w-lg text-[17px] font-light leading-relaxed text-[#9ca3af] sm:text-lg"
            >
              Кастомные сайты и платформы, CRM, продуктовый UI/UX и брендинг —
              под масштаб и процессы вашей компании, без универсальных пакетов.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <Button onClick={openLeadModal}>Создать проект</Button>
              <Button variant="secondary" onClick={() => scrollTo("work")}>
                Смотреть портфолио
              </Button>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="mt-8 text-xs font-medium tracking-wide text-[#71717a]"
            >
              Индивидуальный объём и сроки · NDA · этапы и отчётность без сюрпризов
            </motion.p>
          </motion.div>
        </div>

        <div className="pointer-events-none hidden flex-1 lg:block" aria-hidden />
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 sm:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        aria-hidden
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="flex h-9 w-5 justify-center rounded-full border border-white/10 pt-1.5"
        >
          <div className="h-1 w-px rounded-full bg-[#818cf8]/80" />
        </motion.div>
      </motion.div>
    </section>
  );
}
