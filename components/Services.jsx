"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { LayoutTemplate, Database, Bot, Megaphone, Sparkles, ArrowUpRight } from "lucide-react";
import IconBox from "@/components/ui/IconBox";
import { enterY, visibleY } from "@/lib/motionSafe";
import useSiteSettings from "@/lib/useSiteSettings";

const icons = {
  tilda: LayoutTemplate,
  django: Database,
  agents: Sparkles,
  telegram: Bot,
  marketing: Megaphone,
};

export default function Services() {
  const reduceMotion = useReducedMotion();
  const { settings } = useSiteSettings();
  const services = settings.services;
  const section = settings.servicesSection || {};

  return (
    <section id="services" className="section-y bg-cream-100" aria-labelledby="services-heading">
      <div className="section-padding">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Услуги</p>
        <h2 id="services-heading" className="heading-lg max-w-2xl text-ink">
          {section.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-ink-muted">{section.subtitle}</p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {services.map((s, i) => {
            const Icon = icons[s.id] || LayoutTemplate;
            return (
              <motion.li
                key={s.id}
                initial={enterY(reduceMotion, 14)}
                whileInView={visibleY}
                viewport={{ once: true, margin: "-40px", amount: 0.15 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <Link
                  href={s.href}
                  className="group surface-card flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <IconBox>
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </IconBox>
                  <h3 className="heading-md mt-5 text-ink group-hover:text-teal">{s.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-ink">{s.outcome}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.forWhom}</p>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                    <p className="text-sm font-semibold text-clay">от {s.priceFrom} ₽</p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal">
                      Подробнее
                      <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.75} />
                    </span>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
