"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";
import useSiteSettings from "@/lib/useSiteSettings";
import { trackGoal } from "@/components/analytics/YandexMetrika";

export default function Pricing() {
  const reduceMotion = useReducedMotion();
  const { settings } = useSiteSettings();
  const pricingPackages = settings.pricingPackages;

  const openLead = () => {
    trackGoal("cta_pricing");
    window.dispatchEvent(new CustomEvent("lead-modal:open"));
  };

  return (
    <section id="pricing" className="section-y" aria-labelledby="pricing-heading">
      <div className="section-padding">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Форматы</p>
        <h2 id="pricing-heading" className="heading-lg text-ink">
          Ориентиры по объёму — смета после созвона
        </h2>
        <p className="mt-4 max-w-2xl text-ink-muted">
          Цены задаются в админке («Главная»). Пустые поля показывают TODO_ — на созвоне считаем точный скоуп.
        </p>

        <ul className="mt-10 grid gap-4 lg:grid-cols-3">
          {pricingPackages.map((pkg, i) => (
            <motion.li
              key={pkg.id}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className={`flex flex-col rounded-[18px] border p-6 ${
                pkg.featured
                  ? "border-teal bg-[var(--bg-card)] shadow-lift"
                  : "border-[var(--border-soft)] bg-cream-50 shadow-soft"
              }`}
            >
              {pkg.featured ? <span className="chip mb-3 w-fit">Чаще всего</span> : null}
              <h3 className="font-display text-xl font-bold text-ink">{pkg.name}</h3>
              <p className="mt-2 font-display text-2xl font-extrabold text-teal">{pkg.price}</p>
              <p className="mt-3 text-sm text-ink-muted">{pkg.description}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {pkg.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" strokeWidth={1.75} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" variant={pkg.featured ? "primary" : "secondary"} onClick={openLead}>
                Обсудить этот формат
              </Button>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
