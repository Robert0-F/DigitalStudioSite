"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Globe, Workflow, LayoutTemplate, Sparkles } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/motion";

const services = [
  {
    href: "/services/web",
    title: "Сайты и веб-платформы",
    description:
      "Публичные сервисы и внутренние порталы на современном стеке. Скорость, SEO, безопасность — как у лидеров рынка.",
    icon: Globe,
  },
  {
    href: "/services/crm",
    title: "CRM и автоматизация",
    description:
      "Воронки, сценарии, интеграции. Система под ваш процесс продаж, а не наоборот.",
    icon: Workflow,
  },
  {
    href: "/services/ui-ux",
    title: "UI/UX продуктовый",
    description:
      "Исследования, сценарии, дизайн-системы. Интерфейсы, которые снижают трение и усиливают доверие.",
    icon: LayoutTemplate,
  },
  {
    href: "/services/brand",
    title: "Бренд и айдентика",
    description:
      "Стратегия, визуальный язык, гайдлайны. Единый образ в цифре и офлайне.",
    icon: Sparkles,
  },
];

export default function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="services"
      ref={ref}
      className="py-24 sm:py-32"
      aria-labelledby="services-heading"
    >
      <div className="section-padding">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-16 max-w-2xl"
        >
          <motion.p
            variants={fadeInUp}
            className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.22em] text-[#a5b4fc]"
          >
            Компетенции
          </motion.p>
          <motion.h2
            id="services-heading"
            variants={fadeInUp}
            className="heading-lg font-display font-bold text-white"
          >
            Что создаём
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-[#9ca3af]">
            <Link href="/services" className="text-[#818cf8] hover:underline">
              Все услуги на отдельных страницах →
            </Link>
          </motion.p>
        </motion.div>

        <motion.ul
          className="grid gap-5 sm:grid-cols-2 sm:gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <motion.li key={item.href} variants={fadeInUp} className="group">
                <Link href={item.href} className="block h-full">
                  <article className="glass-luxury h-full rounded-2xl border border-white/[0.06] p-8 transition-all duration-500 hover:-translate-y-0.5 hover:border-[#6366f1]/25 hover:shadow-depth sm:p-9">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#6366f1]/15 bg-[#6366f1]/[0.08] text-[#a5b4fc] transition-colors group-hover:border-[#6366f1]/30 group-hover:bg-[#6366f1]/12">
                      <Icon className="h-7 w-7" strokeWidth={1.25} aria-hidden />
                    </div>
                    <h3 className="mb-3 font-display text-xl font-bold text-white group-hover:text-[#c7d2fe]">
                      {item.title}
                    </h3>
                    <p className="text-[15px] leading-relaxed text-[#9ca3af]">
                      {item.description}
                    </p>
                    <span className="mt-6 inline-block text-sm font-semibold text-[#818cf8] opacity-0 transition-opacity group-hover:opacity-100">
                      Подробнее →
                    </span>
                  </article>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
