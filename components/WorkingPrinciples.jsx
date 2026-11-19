"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Package, Inbox, LineChart } from "lucide-react";
import { turnkeySteps } from "@/lib/siteContent";
import { enterY, visibleY } from "@/lib/motionSafe";

const stepIcons = [Package, Inbox, LineChart];

export default function WorkingPrinciples() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="turnkey" className="section-y surface-inverse" aria-labelledby="turnkey-heading">
      <div className="section-padding">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-soft)]">Под ключ</p>
        <h2 id="turnkey-heading" className="heading-lg max-w-2xl text-[var(--text-inverse)]">
          Продукт, заявки и трафик — без «отдела на отдел»
        </h2>
        <p className="mt-4 max-w-2xl text-[var(--text-inverse)]/70">
          Один контур: сделали → подключили сбор лидов → при необходимости запустили рекламу. Вам не нужно трижды объяснять задачу.
        </p>

        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {turnkeySteps.map((step, idx) => {
            const Icon = stepIcons[idx] || Package;
            return (
              <motion.li
                key={step.title}
                initial={enterY(reduceMotion, 12)}
                whileInView={visibleY}
                viewport={{ once: true, margin: "-40px", amount: 0.15 }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                className="rounded-[18px] border border-white/10 bg-white/[0.04] p-6"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-white/10 text-[var(--accent-soft)]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[var(--accent-soft)]">
                  Шаг {idx + 1}
                </p>
                <h3 className="mt-2 font-display text-xl font-bold text-[var(--text-inverse)]">{step.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-inverse)]/65">{step.text}</p>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
